import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertiesApiService } from '../../services/properties-api.service';
import { Property, PropertyStatus } from '../../models/property.models';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.page.html',
  styleUrls: ['./property-detail.page.scss'],
})
export class PropertyDetailPage implements OnInit, OnDestroy {
  property: Property | null = null;
  isLoading = false;
  isUpdating = false;
  selectedStatus: PropertyStatus | null = null;
  propertyStatuses: PropertyStatus[] = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'VENTA', 'ALQUILER'];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertiesApiService: PropertiesApiService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.loadProperty();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProperty(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/properties']);
      return;
    }

    this.propertiesApiService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.property = data;
          this.selectedStatus = data.status;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading property:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar propiedad');
          this.router.navigate(['/properties']);
        },
      });
  }

  async updateStatus(): Promise<void> {
    if (!this.property || !this.selectedStatus) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Cambiar estado',
      message: `¿Deseas cambiar el estado de esta propiedad?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.performStatusUpdate();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performStatusUpdate(): Promise<void> {
    if (!this.property || !this.selectedStatus) {
      return;
    }

    this.isUpdating = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
    });
    await loading.present();

    this.propertiesApiService
      .update(this.property.id, { status: this.selectedStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          loading.dismiss();
          this.isUpdating = false;
          this.property = updated;
          this.showSuccessToast('Estado actualizado');
        },
        error: (error) => {
          loading.dismiss();
          this.isUpdating = false;
          console.error('Error updating property:', error);
          this.showErrorToast('Error al actualizar propiedad');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/properties']);
  }

  getStatusColor(status: PropertyStatus): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'success';
      case 'OCUPADA':
        return 'primary';
      case 'MANTENIMIENTO':
        return 'warning';
      case 'VENTA':
        return 'secondary';
      case 'ALQUILER':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: PropertyStatus): string {
    const labels: Record<PropertyStatus, string> = {
      DISPONIBLE: 'Disponible',
      OCUPADA: 'Ocupada',
      MANTENIMIENTO: 'Mantenimiento',
      VENTA: 'Venta',
      ALQUILER: 'Alquiler',
    };
    return labels[status] || status;
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
