import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { PackageItem, PackageStatus } from '../../models/package.models';
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
  private readonly alertController = inject(AlertController);

  packageItem: PackageItem | null = null;
  loading = false;
  mutating = false;

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
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  updateStatus(status: PackageStatus): void {
    if (!this.packageItem || this.mutating) {
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
    if (!this.packageItem || this.mutating) {
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

            this.submitDelivery(deliveredToName);
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

  private submitDelivery(deliveredToName: string): void {
    if (!this.packageItem) {
      return;
    }

    this.mutating = true;
    this.packagesApiService.deliver(this.packageItem.id, { deliveredToName })
      .pipe(finalize(() => {
        this.mutating = false;
      }))
      .subscribe({
        next: async (packageItem) => {
          this.packageItem = packageItem;
          await this.feedbackService.success('Encomienda entregada correctamente.');
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }
}
