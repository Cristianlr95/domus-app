import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { PackageItem, PackageStatus } from '../../models/package.models';
import { PackagesApiService } from '../../services/packages-api.service';
import { PackageCreatePage } from '../package-create/package-create.page';

@Component({
  selector: 'app-packages-list-page',
  templateUrl: './packages-list.page.html',
  styleUrls: ['./packages-list.page.scss'],
  standalone: false,
})
export class PackagesListPage {
  private readonly packagesApiService = inject(PackagesApiService);
  private readonly feedbackService = inject(FeedbackService);
  readonly authService = inject(AuthService);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly router = inject(Router);
  private readonly modalController = inject(ModalController);

  packages: PackageItem[] = [];
  loading = false;
  selectedStatus: PackageStatus | '' = '';
  search = '';

  get canCreatePackages(): boolean {
    return this.authorizationService.hasPermission(PERMISSIONS.PACKAGES_CREATE);
  }

  ionViewWillEnter(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading = true;
    this.packagesApiService.list(this.selectedStatus, this.search)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (packages) => {
          this.packages = packages;
        },
        error: async (error) => {
          await this.feedbackService.error(this.authService.getErrorMessage(error));
        },
      });
  }

  onFilterChange(): void {
    this.loadPackages();
  }

  async createPackage(): Promise<void> {
    if (!this.canCreatePackages) {
      return;
    }

    const modal = await this.modalController.create({
      component: PackageCreatePage,
      componentProps: { modalMode: true },
      cssClass: 'package-create-modal',
      backdropDismiss: false,
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.role === 'created') {
      this.loadPackages();
    }
  }

  openDetail(packageId: string): void {
    void this.router.navigate(['/packages', packageId]);
  }

  trackByPackage(_index: number, packageItem: PackageItem): string {
    return packageItem.id;
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

  statusColor(status: PackageStatus): 'warning' | 'primary' | 'success' | 'medium' {
    switch (status) {
      case 'RECIBIDA':
        return 'warning';
      case 'NOTIFICADA':
        return 'primary';
      case 'ENTREGADA':
        return 'success';
      case 'CANCELADA':
        return 'medium';
    }
  }
}
