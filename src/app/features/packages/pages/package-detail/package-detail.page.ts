import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { PackageCustodyEvent, PackageIncident, PackageItem, PackagePickupMethod, PackageStatus } from '../../models/package.models';
import { PackagesApiService } from '../../services/packages-api.service';

@Component({
  selector: 'app-package-detail-page',
  templateUrl: './package-detail.page.html',
  styleUrls: ['./package-detail.page.scss'],
  standalone: false,
})
export class PackageDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly packagesApiService = inject(PackagesApiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly alertController = inject(AlertController);

  packageItem: PackageItem | null = null;
  custodyEvents: PackageCustodyEvent[] = [];
  incidents: PackageIncident[] = [];
  loading = false;
  mutating = false;

  get canUpdatePackages(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.PACKAGES_UPDATE);
  }

  get canManageCustody(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.PACKAGES_CUSTODY_MANAGE);
  }

  ionViewWillEnter(): void {
    this.loadPackage();
  }

  loadPackage(): void {
    const packageId = this.route.snapshot.paramMap.get('id');
    if (!packageId) {
      return;
    }

    this.loading = true;
    this.packagesApiService.getById(packageId)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (packageItem) => {
          this.packageItem = packageItem;
          this.loadCustodyEvents(packageItem.id);
          this.loadIncidents(packageItem.id);
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  updateStatus(status: PackageStatus): void {
    if (!this.canUpdatePackages || !this.packageItem || this.mutating) {
      return;
    }

    this.mutating = true;
    this.packagesApiService.updateStatus(this.packageItem.id, { status })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (packageItem) => {
          this.packageItem = packageItem;
          await this.feedbackService.success('Estado actualizado correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  async deliver(): Promise<void> {
    if (!this.canManageCustody || !this.packageItem || this.mutating) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Marcar entrega',
      inputs: [
        {
          name: 'deliveredToName',
          type: 'text',
          placeholder: 'Nombre de quien retira',
        },
        {
          name: 'method',
          type: 'radio',
          label: 'Libro físico',
          value: 'MANUAL_BOOK',
          checked: true,
        },
        {
          name: 'method',
          type: 'radio',
          label: 'QR DOMUS',
          value: 'QR',
        },
        {
          name: 'method',
          type: 'radio',
          label: 'Persona autorizada',
          value: 'TRUSTED_PERSON',
        },
        {
          name: 'token',
          type: 'text',
          placeholder: 'Token QR (solo si corresponde)',
        },
        {
          name: 'bookNumber',
          type: 'text',
          placeholder: 'N.º de libro (si retira por libro físico)',
        },
        {
          name: 'bookPage',
          type: 'number',
          placeholder: 'Página del libro físico',
          min: 1,
        },
        {
          name: 'notes',
          type: 'textarea',
          placeholder: 'Libro/página o notas de entrega',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Entregar',
          handler: (value) => {
            const deliveredToName = String(value.deliveredToName ?? '').trim();
            if (!deliveredToName) {
              void this.feedbackService.error('Debes indicar quien retira la encomienda.');
              return false;
            }

            const method = String(value.method ?? 'MANUAL_BOOK') as PackagePickupMethod;
            const bookNumber = String(value.bookNumber ?? '').trim() || null;
            const bookPage = Number(value.bookPage ?? 0) || null;
            if (method === 'MANUAL_BOOK' && (!bookNumber || !bookPage)) {
              void this.feedbackService.error('Para el libro físico debes indicar número de libro y página.');
              return false;
            }
            this.submitDelivery(deliveredToName, method, String(value.token ?? '').trim() || null, bookNumber, bookPage, String(value.notes ?? '').trim() || null);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  availableNextStatuses(status: PackageStatus): PackageStatus[] {
    switch (status) {
      case 'RECIBIDA':
        return ['NOTIFICADA', 'CANCELADA'];
      case 'NOTIFICADA':
        return ['CANCELADA'];
      default:
        return [];
    }
  }

  statusLabel(status: PackageStatus): string {
    switch (status) {
      case 'RECIBIDA':
        return 'Recibida';
      case 'NOTIFICADA':
        return 'Notificada';
      case 'ENTREGADA':
        return 'Entregada';
      case 'CANCELADA':
        return 'Cancelada';
    }
  }

  private submitDelivery(deliveredToName: string, method: PackagePickupMethod, token: string | null, bookNumber: string | null, bookPage: number | null, notes: string | null): void {
    if (!this.canManageCustody || !this.packageItem) {
      return;
    }

    this.mutating = true;
    this.packagesApiService.deliverFromCustody({ packageIds: [this.packageItem.id], receiverName: deliveredToName, method, token, bookNumber, bookPage, notes })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async () => {
          await this.feedbackService.success('Entrega registrada en la cadena de custodia.');
          this.loadPackage();
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  custodyEventLabel(eventType: string): string {
    return ({ RECEIVED: 'Recepción registrada', NOTIFIED: 'Residente notificado', DELIVERED: 'Entrega confirmada' } as Record<string, string>)[eventType] ?? eventType;
  }

  custodyActor(event: PackageCustodyEvent): string {
    return [event.actor_first_name, event.actor_last_name].filter(Boolean).join(' ') || 'Sistema';
  }

  async reportIncident(): Promise<void> {
    if (!this.canManageCustody || !this.packageItem || this.mutating) {
      return;
    }
    const alert = await this.alertController.create({
      header: 'Registrar incidente',
      inputs: [
        { name: 'category', type: 'text', placeholder: 'Ej: DAÑO_VISIBLE, NO_ENCONTRADA' },
        { name: 'description', type: 'textarea', placeholder: 'Describe lo ocurrido' },
        { name: 'evidenceReference', type: 'url', placeholder: 'Referencia de evidencia (opcional)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (value) => {
            const category = String(value.category ?? '').trim();
            const description = String(value.description ?? '').trim();
            if (!category || !description) {
              void this.feedbackService.error('Indica categoría y descripción del incidente.');
              return false;
            }
            this.mutating = true;
            this.packagesApiService.createIncident({
              packageId: this.packageItem!.id,
              category,
              description,
              evidenceReference: String(value.evidenceReference ?? '').trim() || null,
            }).pipe(finalize(() => this.mutating = false)).subscribe({
              next: async () => {
                await this.feedbackService.success('Incidente registrado en la cadena de custodia.');
                this.loadPackage();
              },
              error: async (error) => this.feedbackService.error(this.authService.getErrorMessage(error)),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async resolveIncident(incident: PackageIncident): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Resolver incidente',
      inputs: [{ name: 'resolution', type: 'textarea', placeholder: 'Resolución aplicada' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Resolver',
          handler: (value) => {
            const resolution = String(value.resolution ?? '').trim();
            if (!resolution) {
              void this.feedbackService.error('Describe la resolución aplicada.');
              return false;
            }
            this.mutating = true;
            this.packagesApiService.resolveIncident(incident.id, resolution)
              .pipe(finalize(() => this.mutating = false))
              .subscribe({
                next: async () => { await this.feedbackService.success('Incidente resuelto.'); this.loadPackage(); },
                error: async (error) => this.feedbackService.error(this.authService.getErrorMessage(error)),
              });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private loadCustodyEvents(packageId: string): void {
    if (!this.canManageCustody) {
      this.custodyEvents = [];
      return;
    }
    this.packagesApiService.listCustodyEvents(packageId).subscribe({
      next: (events) => this.custodyEvents = events,
      error: () => this.custodyEvents = [],
    });
  }

  private loadIncidents(packageId: string): void {
    if (!this.canManageCustody) {
      this.incidents = [];
      return;
    }
    this.packagesApiService.listIncidents(packageId).subscribe({
      next: (incidents) => this.incidents = incidents,
      error: () => this.incidents = [],
    });
  }
}
