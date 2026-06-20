import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertiesApiService } from '../../services/properties-api.service';
import {
  Property,
  PropertyFilter,
  PropertyStatus,
  PropertyType,
} from '../../models/property.models';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-properties-list',
  templateUrl: './properties-list.page.html',
  styleUrls: ['./properties-list.page.scss'],
  standalone: false,
})
export class PropertiesListPage implements OnInit, OnDestroy {
  private readonly propertiesApiService = inject(PropertiesApiService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  properties: Property[] = [];
  isLoading = false;
  selectedType: PropertyType | '' = '';
  selectedStatus: PropertyStatus | '' = '';
  searchTerm = '';
  private destroy$ = new Subject<void>();

  propertyTypes: PropertyType[] = [
    'APARTAMENTO',
    'CASA',
    'SUITE',
    'ESTUDIO',
    'PENTHOUSE',
    'OTRO',
  ];
  propertyStatuses: PropertyStatus[] = [
    'DISPONIBLE',
    'OCUPADA',
    'MANTENIMIENTO',
    'VENTA',
    'ALQUILER',
  ];

  ngOnInit(): void {
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(): void {
    this.isLoading = true;
    const filter: PropertyFilter = {
      type: this.selectedType,
      status: this.selectedStatus,
      search: this.searchTerm,
    };

    this.propertiesApiService
      .list(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.properties = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.isLoading = false;
          this.showErrorToast('Error al cargar propiedades');
        },
      });
  }

  onFilterChange(): void {
    this.loadProperties();
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.loadProperties();
  }

  viewDetails(propertyId: string): void {
    this.router.navigate(['/properties', propertyId]);
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

  getTypeLabel(type: PropertyType): string {
    const labels: Record<PropertyType, string> = {
      APARTAMENTO: 'Apartamento',
      CASA: 'Casa',
      SUITE: 'Suite',
      ESTUDIO: 'Estudio',
      PENTHOUSE: 'Penthouse',
      OTRO: 'Otro',
    };
    return labels[type] || type;
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
}
