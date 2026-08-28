import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { LaundryMachine, LaundryMetrics, LaundryUsage } from '../../models/laundry.models';
import { LaundryApiService } from '../../services/laundry-api.service';

@Component({ selector: 'app-laundry-page', templateUrl: './laundry.page.html', styleUrls: ['./laundry.page.scss'], standalone: false })
export class LaundryPage {
  private readonly api = inject(LaundryApiService);
  private readonly auth = inject(AuthService);
  private readonly authorization = inject(AuthorizationService);
  private readonly feedback = inject(FeedbackService);
  private readonly alerts = inject(AlertController);
  machines: LaundryMachine[] = [];
  usages: LaundryUsage[] = [];
  metrics: LaundryMetrics | null = null;
  loading = false;
  mutating = false;
  get canManage(): boolean { return this.authorization.hasPermission(PERMISSIONS.LAUNDRY_MANAGE); }
  get upcoming(): LaundryUsage[] { return this.usages.filter((usage) => !['RELEASED', 'CANCELLED', 'REJECTED'].includes(usage.status)).slice(0, 12); }
  ionViewWillEnter(): void { this.load(); }
  load(): void {
    this.loading = true;
    forkJoin({ machines: this.api.machines(), usages: this.api.usages(), metrics: this.canManage ? this.api.metrics().pipe(catchError(() => of(null))) : of(null) })
      .pipe(finalize(() => this.loading = false)).subscribe({ next: ({ machines, usages, metrics }) => { this.machines = machines; this.usages = usages; this.metrics = metrics; }, error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)) });
  }
  async request(machine: LaundryMachine): Promise<void> {
    if (machine.status !== 'AVAILABLE' || this.mutating) return;
    const alert = await this.alerts.create({ header: `Solicitar ${machine.asset_name}`, message: `Buffer: ${machine.buffer_before_minutes} min antes y ${machine.buffer_after_minutes} min después.`, inputs: [{ name: 'start', type: 'datetime-local', label: 'Inicio programado' }, { name: 'end', type: 'datetime-local', label: 'Término programado' }], buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Solicitar', handler: (value) => { if (!value.start || !value.end) { void this.feedback.error('Indica inicio y término.'); return false; } this.mutating = true; this.api.request(machine.id, new Date(value.start).toISOString(), new Date(value.end).toISOString()).pipe(finalize(() => this.mutating = false)).subscribe({ next: async () => { await this.feedback.success('Solicitud enviada a conserjería.'); this.load(); }, error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)) }); return true; } }] });
    await alert.present();
  }
  transition(usage: LaundryUsage, status: string): void { if (!this.canManage || this.mutating) return; this.mutating = true; this.api.transition(usage.id, status).pipe(finalize(() => this.mutating = false)).subscribe({ next: async () => { await this.feedback.success('Estado actualizado.'); this.load(); }, error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)) }); }
  async reportFailure(usage: LaundryUsage): Promise<void> {
    const alert = await this.alerts.create({ header: 'Reportar falla', message: 'El equipo quedará fuera de servicio y se creará un incidente de mantenimiento.', inputs: [{ name: 'notes', type: 'textarea', placeholder: 'Describe la falla: fuga, puerta bloqueada, error en pantalla...' }], buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Reportar falla', role: 'destructive', handler: (value) => { const notes = String(value.notes ?? '').trim(); if (!notes) { void this.feedback.error('Describe la falla observada.'); return false; } this.mutating = true; this.api.transition(usage.id, 'FAILED', notes).pipe(finalize(() => this.mutating = false)).subscribe({ next: async () => { await this.feedback.success('Falla registrada y equipo bloqueado.'); this.load(); }, error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)) }); return true; } }] });
    await alert.present();
  }
  machineLabel(machine: LaundryMachine): string { return `${machine.machine_type === 'WASHER' ? 'Lavadora' : 'Secadora'} · ${machine.asset_name}`; }
  nextAction(usage: LaundryUsage): { label: string; status: string } | null { const actions: Record<string, { label: string; status: string }> = { REQUESTED: { label: 'Autorizar', status: 'AUTHORIZED' }, AUTHORIZED: { label: 'Preparar', status: 'READY' }, READY: { label: 'Iniciar uso', status: 'IN_USE' }, IN_USE: { label: 'Finalizar', status: 'FINISHED' }, FINISHED: { label: 'Liberar', status: 'RELEASED' } }; return actions[usage.status] ?? null; }
}
