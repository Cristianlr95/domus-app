import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import {
  ParkingOperationalSpace,
  ParkingMetrics,
  ParkingRate,
  ParkingSession,
  ParkingSessionStatus,
  ParkingUnitOption,
} from '../../models/parking.models';
import { ParkingApiService } from '../../services/parking-api.service';

@Component({
  selector: 'app-parking-list-page',
  templateUrl: './parking-list.page.html',
  styleUrls: ['./parking-list.page.scss'],
  standalone: false,
})
export class ParkingListPage implements OnDestroy {
  private readonly api = inject(ParkingApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly feedback = inject(FeedbackService);
  private readonly auth = inject(AuthService);
  private readonly authorization = inject(AuthorizationService);
  private readonly router = inject(Router);
  private readonly clock = window.setInterval(() => this.now = Date.now(), 30_000);

  readonly requestForm = this.formBuilder.nonNullable.group({
    unitId: ['', Validators.required],
    parkingSpotId: [''],
    visitorName: ['', Validators.maxLength(150)],
    vehiclePlate: ['', Validators.maxLength(20)],
    notes: ['', Validators.maxLength(500)],
  });
  readonly rateForm = this.formBuilder.nonNullable.group({
    name: ['General', Validators.required],
    amountPerHour: [1000, [Validators.required, Validators.min(0)]],
    graceMinutes: [0, [Validators.required, Validators.min(0)]],
    roundingMinutes: [1, [Validators.required, Validators.min(1)]],
    effectiveFrom: [this.localDateTime(), Validators.required],
  });

  spaces: ParkingOperationalSpace[] = [];
  units: ParkingUnitOption[] = [];
  sessions: ParkingSession[] = [];
  activeRate: ParkingRate | null = null;
  metrics: ParkingMetrics | null = null;
  loading = false;
  submitting = false;
  now = Date.now();

  get canOperate(): boolean {
    return this.authorization.hasPermission(PERMISSIONS.PARKING_SESSIONS_MANAGE);
  }

  get canManageSpaces(): boolean {
    return this.authorization.hasRole('ADMIN')
      && this.authorization.hasPermission(PERMISSIONS.PARKING_SPACES_MANAGE);
  }

  get canConfigure(): boolean {
    return this.authorization.hasRole('ADMIN');
  }

  get availableSpaces(): ParkingOperationalSpace[] {
    return this.spaces.filter((space) => space.is_active && space.occupancy_status === 'DISPONIBLE');
  }

  get activeSessions(): ParkingSession[] {
    return this.sessions.filter((session) => !['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(session.status));
  }

  get history(): ParkingSession[] {
    return this.sessions.filter((session) => ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(session.status));
  }

  ionViewWillEnter(): void { this.load(); }
  ngOnDestroy(): void { window.clearInterval(this.clock); }

  sessionsByStatus(status: ParkingSessionStatus): number {
    return this.activeSessions.filter((session) => session.status === status).length;
  }

  load(): void {
    this.loading = true;
    forkJoin({
      spaces: this.api.operationalSpaces(),
      units: this.api.operationalUnits(),
      sessions: this.api.sessions(),
      rate: this.api.activeRate().pipe(catchError(() => of(null))),
      metrics: this.canConfigure ? this.api.metrics() : of(null),
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: ({ spaces, units, sessions, rate, metrics }) => {
        this.spaces = spaces;
        this.units = units;
        this.sessions = sessions.map((session) => ({
          ...session,
          assignmentSpotId: session.parking_spot_id ?? '',
          plateInput: session.vehicle_plate ?? '',
        }));
        this.activeRate = rate;
        this.metrics = metrics;
      },
      error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
    });
  }

  request(): void {
    if (this.requestForm.invalid || this.submitting) { this.requestForm.markAllAsTouched(); return; }
    this.submitting = true;
    const value = this.requestForm.getRawValue();
    this.api.createSession({
      unitId: value.unitId,
      parkingSpotId: value.parkingSpotId || null,
      visitorName: value.visitorName.trim() || null,
      vehiclePlate: value.vehiclePlate.trim().toUpperCase() || null,
      notes: value.notes.trim() || null,
    }).pipe(finalize(() => this.submitting = false)).subscribe({
      next: async () => { this.requestForm.reset(); await this.feedback.success('Solicitud de estacionamiento enviada.'); this.load(); },
      error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
    });
  }

  transition(session: ParkingSession, status: ParkingSessionStatus): void {
    const payload: Record<string, unknown> = { status };
    if (status === 'RESERVED') { payload['parkingSpotId'] = session.assignmentSpotId || null; }
    if (status === 'OCCUPIED') { payload['vehiclePlate'] = session.plateInput?.trim().toUpperCase() || null; }
    if (status === 'CANCELLED') { payload['cancellationReason'] = 'Cancelación confirmada por conserjería'; }
    this.api.transitionSession(session.id, payload).subscribe({
      next: async () => { await this.feedback.success(this.transitionMessage(status)); this.load(); },
      error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
    });
  }

  saveRate(): void {
    if (this.rateForm.invalid || this.submitting) { this.rateForm.markAllAsTouched(); return; }
    this.submitting = true;
    const value = this.rateForm.getRawValue();
    this.api.createRate({ ...value, currency: 'CLP', effectiveFrom: new Date(value.effectiveFrom).toISOString() })
      .pipe(finalize(() => this.submitting = false)).subscribe({
        next: async () => { await this.feedback.success('Nueva tarifa creada; sólo aplicará a futuras reservas.'); this.load(); },
        error: async (error) => this.feedback.error(this.auth.getErrorMessage(error)),
      });
  }

  openSpaceAdministration(): void { void this.router.navigate(['/parking/new']); }

  elapsedMinutes(session: ParkingSession): number {
    if (!session.billable_from) { return 0; }
    const end = session.completed_at ? new Date(session.completed_at).getTime() : this.now;
    return Math.max(0, Math.floor((end - new Date(session.billable_from).getTime()) / 60_000));
  }

  currentAmount(session: ParkingSession): number {
    if (session.completed_at) { return Number(session.total_amount ?? 0); }
    if (!session.rate_amount_snapshot || !session.billable_from) { return 0; }
    const minutes = this.elapsedMinutes(session);
    const grace = Number(session.grace_minutes_snapshot ?? 0);
    if (minutes <= grace) { return 0; }
    const rounding = Math.max(1, Number(session.rounding_minutes_snapshot ?? 1));
    const roundedMinutes = Math.ceil((minutes - grace) / rounding) * rounding;
    return Number(session.rate_amount_snapshot) * roundedMinutes / 60;
  }

  duration(minutes: number): string {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}`;
  }

  statusLabel(status: ParkingSessionStatus): string {
    return ({ REQUESTED: 'Solicitado', RESERVED: 'Reservado', OCCUPIED: 'En uso', END_REQUESTED: 'Término solicitado', COMPLETED: 'Completado', REJECTED: 'Rechazado', CANCELLED: 'Cancelado', EXPIRED: 'Expirado' })[status];
  }

  private transitionMessage(status: ParkingSessionStatus): string {
    return ({ RESERVED: 'Reserva confirmada; el cobro comenzó ahora.', REJECTED: 'Solicitud rechazada.', OCCUPIED: 'Llegada del vehículo confirmada.', END_REQUESTED: 'Conserjería fue avisada para verificar la salida.', COMPLETED: 'Salida verificada y estacionamiento liberado.', CANCELLED: 'Cancelación confirmada y cobro liquidado.', REQUESTED: 'Solicitud actualizada.', EXPIRED: 'Solicitud expirada.' })[status];
  }

  private localDateTime(): string {
    const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
    return date.toISOString().slice(0, 16);
  }
}
