import { Component, inject } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import {
  OperationsAction,
  OperationsResource,
  OperationsRow,
  OperationsSummary,
} from '../../models/operations.models';
import { OperationsApiService } from '../../services/operations-api.service';

@Component({
  selector: 'app-operations-center',
  templateUrl: './operations-center.page.html',
  styleUrls: ['./operations-center.page.scss'],
  standalone: false,
})
export class OperationsCenterPage {
  private readonly api = inject(OperationsApiService);
  private readonly feedback = inject(FeedbackService);
  private readonly auth = inject(AuthService);
  private readonly authorization = inject(AuthorizationService);

  readonly resources: OperationsResource[] = [
    { key: 'residents', label: 'Residentes', icon: 'people-outline', resource: 'memberships', description: 'Membresías y ocupación histórica' },
    { key: 'setup', label: 'Configuración', icon: 'construct-outline', resource: 'setup-batches', description: 'Puesta en marcha de la comunidad' },
    { key: 'access', label: 'Visitas y QR', icon: 'qr-code-outline', resource: 'invitations', description: 'Invitaciones y trazabilidad de ingreso' },
    { key: 'parking', label: 'Estacionamientos', icon: 'car-outline', resource: 'parking-sessions', description: 'Reservas, ocupación y cobros' },
    { key: 'packages', label: 'Encomiendas', icon: 'cube-outline', resource: 'package-receptions', description: 'Recepciones masivas y custodia' },
    { key: 'governance', label: 'Documentos', icon: 'document-text-outline', resource: 'governance-documents', description: 'Reglamentos y documentos vigentes' },
    { key: 'sanctions', label: 'Convivencia', icon: 'warning-outline', resource: 'sanction-cases', description: 'Reglas, descargos y resoluciones' },
    { key: 'finance', label: 'Finanzas', icon: 'cash-outline', resource: 'finance-periods', description: 'Períodos, cargos y pagos' },
    { key: 'maintenance', label: 'Mantenimiento', icon: 'build-outline', resource: 'incidents', description: 'Activos e incidentes técnicos' },
    { key: 'laundry', label: 'Lavandería', icon: 'water-outline', resource: 'laundry-usages', description: 'Máquinas, turnos y límites de uso' },
  ];

  readonly actions: OperationsAction[] = [
    { key: 'membership', label: 'Solicitar membresía', method: 'POST', path: '/memberships', permissions: [PERMISSIONS.RESIDENTS_MEMBERSHIP_REQUEST], sample: { residentId: '', unitId: '', membershipType: 'TENANT', residenceStatus: 'RESIDENT', emergencyContactName: '', emergencyContactPhone: '', validFrom: new Date().toISOString().slice(0, 10) } },
    { key: 'condominium', label: 'Crear condominio', method: 'POST', path: '/setup/condominiums', permissions: [PERMISSIONS.SETUP_MANAGE], sample: { name: '', address: '' } },
    { key: 'setup-preview', label: 'Previsualizar carga inicial', method: 'POST', path: '/setup/preview', permissions: [PERMISSIONS.SETUP_MANAGE], sample: { condominiumId: '', batchType: 'MANUAL', sourceName: '', units: [{ blockLabel: 'A', unitCode: '101', floorNumber: 1 }] } },
    { key: 'invitation', label: 'Crear invitación', method: 'POST', path: '/access/invitations', permissions: [PERMISSIONS.ACCESS_REQUEST, PERMISSIONS.ACCESS_MANAGE], sample: { unitId: '', visitorName: '', invitationType: 'SINGLE', validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 3600000).toISOString() } },
    { key: 'access-token', label: 'Validar ingreso con QR', method: 'POST', path: '/access/token/events', permissions: [PERMISSIONS.ACCESS_MANAGE], sample: { token: '', eventType: 'CHECKED_IN', source: 'QR', notes: '' } },
    { key: 'parking-rate', label: 'Crear tarifa de estacionamiento', method: 'POST', path: '/parking/rates', permissions: [PERMISSIONS.PARKING_SESSIONS_MANAGE], sample: { name: 'General', amountPerHour: 1000, graceMinutes: 15, roundingMinutes: 30, currency: 'CLP', effectiveFrom: new Date().toISOString() } },
    { key: 'parking', label: 'Solicitar estacionamiento', method: 'POST', path: '/parking/sessions', permissions: [PERMISSIONS.PARKING_SESSIONS_REQUEST, PERMISSIONS.PARKING_SESSIONS_MANAGE], sample: { parkingSpotId: '', unitId: '', visitorName: '', vehiclePlate: '' } },
    { key: 'packages', label: 'Registrar recepción masiva', method: 'POST', path: '/packages/receptions', permissions: [PERMISSIONS.PACKAGES_CUSTODY_MANAGE], sample: { carrier: '', packages: [{ description: '', residentName: '', unitLabel: '', blockLabel: '', packageType: 'PAQUETE' }] } },
    { key: 'package-authorization', label: 'Autorizar retiro de encomienda', method: 'POST', path: '/packages/authorizations', permissions: [PERMISSIONS.PACKAGES_PICKUP_REQUEST, PERMISSIONS.PACKAGES_CUSTODY_MANAGE], sample: { unitId: '', authorizedPersonName: '', authorizedPersonDocument: '', authorizationType: 'SINGLE', validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 86400000).toISOString() } },
    { key: 'package-delivery', label: 'Entregar encomiendas', method: 'POST', path: '/packages/deliveries', permissions: [PERMISSIONS.PACKAGES_CUSTODY_MANAGE], sample: { packageIds: [''], receiverName: '', method: 'QR', token: '', notes: '' } },
    { key: 'document', label: 'Crear documento', method: 'POST', path: '/governance/documents', sample: { documentType: 'REGULATION', title: '', documentVersion: '1.0', contentText: '', effectiveFrom: new Date().toISOString().slice(0, 10) } },
    { key: 'acknowledge', label: 'Acusar recibo de documento', method: 'POST', path: '/governance/documents/{id}/acknowledgements', requiresId: true, sample: {} },
    { key: 'sanction-rule', label: 'Crear regla de sanción', method: 'POST', path: '/sanctions/rules', sample: { documentId: '', code: '', title: '', description: '', severity: 'MEDIUM', fineAmount: 0, currency: 'CLP', effectiveFrom: new Date().toISOString().slice(0, 10) } },
    { key: 'sanction-case', label: 'Reportar caso de sanción', method: 'POST', path: '/sanctions/cases', sample: { ruleId: '', unitId: '', description: '', occurredAt: new Date().toISOString() } },
    { key: 'sanction-response', label: 'Responder sanción', method: 'POST', path: '/sanctions/cases/{id}/responses', requiresId: true, sample: { response: '' } },
    { key: 'finance', label: 'Crear período financiero', method: 'POST', path: '/finance/periods', sample: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, dueDate: new Date(Date.now() + 864000000).toISOString().slice(0, 10) } },
    { key: 'charge', label: 'Agregar cargo financiero', method: 'POST', path: '/finance/charges', sample: { statementId: '', chargeType: 'ORDINARY', description: '', amount: 0 } },
    { key: 'payment', label: 'Registrar pago', method: 'POST', path: '/finance/payments', sample: { unitId: '', amount: 0, method: 'TRANSFER', externalReference: '', paidAt: new Date().toISOString() } },
    { key: 'allocation', label: 'Imputar pago', method: 'POST', path: '/finance/payments/{id}/allocations', requiresId: true, sample: { statementId: '', amount: 0 } },
    { key: 'reserve', label: 'Movimiento fondo de reserva', method: 'POST', path: '/finance/reserve-movements', sample: { movementType: 'INCOME', amount: 0, description: '', occurredAt: new Date().toISOString() } },
    { key: 'adjustment', label: 'Ajuste financiero', method: 'POST', path: '/finance/adjustments', sample: { statementId: '', adjustmentType: 'DEBIT', amount: 0, reason: '' } },
    { key: 'agreement', label: 'Convenio de pago', method: 'POST', path: '/finance/payment-agreements', sample: { unitId: '', totalAmount: 0, installmentCount: 3, startsOn: new Date().toISOString().slice(0, 10) } },
    { key: 'asset', label: 'Crear activo', method: 'POST', path: '/maintenance/assets', sample: { code: '', assetType: 'EQUIPMENT', name: '', location: '' } },
    { key: 'incident', label: 'Reportar incidente', method: 'POST', path: '/maintenance/incidents', sample: { assetId: '', priority: 'MEDIUM', category: 'FAILURE', description: '' } },
    { key: 'maintenance-plan', label: 'Crear plan de mantenimiento', method: 'POST', path: '/maintenance/plans', sample: { assetId: '', name: '', frequencyDays: 90, nextRunAt: new Date(Date.now() + 86400000).toISOString(), providerName: '' } },
    { key: 'machine', label: 'Registrar máquina de lavandería', method: 'POST', path: '/laundry/machines', sample: { assetId: '', machineType: 'WASHER', operationMode: 'TOKEN', bufferBeforeMinutes: 15, bufferAfterMinutes: 15, usageLimitPerWeek: 3, tokenPrice: 1000 } },
    { key: 'laundry', label: 'Solicitar lavandería', method: 'POST', path: '/laundry/usages', sample: { machineId: '', scheduledStart: new Date(Date.now() + 3600000).toISOString(), scheduledEnd: new Date(Date.now() + 7200000).toISOString(), tokensDelivered: 0 } },
    { key: 'status', label: 'Cambiar estado', method: 'PATCH', path: '/{customPath}/{id}/status', requiresId: true, sample: { customPath: 'parking/sessions', status: 'RESERVED', notes: '' } },
  ];

  summary: OperationsSummary = {};
  rows: OperationsRow[] = [];
  selectedResource = this.resources[0];
  selectedAction = this.actions[0];
  payloadText = JSON.stringify(this.selectedAction.sample, null, 2);
  draftValues: Record<string, string> = {};
  actionFields: { key: string; label: string; type: string; required: boolean }[] = [];
  entityId = '';
  loading = false;
  executing = false;

  constructor() {
    this.selectAction();
  }

  get canBrowseResources(): boolean {
    return this.authorization.hasPermission(PERMISSIONS.OPERATIONS_READ);
  }

  get visibleActions(): OperationsAction[] {
    if (this.authorization.hasRole('ADMIN')) {
      return this.actions;
    }

    return this.actions.filter((action) => {
      if (!action.permissions?.length) {
        return false;
      }
      return this.authorization.hasAnyPermission(action.permissions);
    });
  }

  ionViewWillEnter(): void {
    const firstVisibleAction = this.visibleActions[0];
    if (firstVisibleAction && !this.visibleActions.includes(this.selectedAction)) {
      this.selectedAction = firstVisibleAction;
      this.selectAction();
    }
    this.refresh();
  }

  get summaryEntries(): { key: string; value: number }[] {
    return Object.entries(this.summary).map(([key, value]) => ({ key, value }));
  }

  refresh(): void {
    if (!this.canBrowseResources) {
      this.summary = {};
      this.rows = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    forkJoin({
      summary: this.api.summary(),
      rows: this.api.list(this.selectedResource.resource),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ summary, rows }) => {
          this.summary = summary;
          this.rows = rows;
        },
        error: (error) => this.showError(error),
      });
  }

  selectResource(resource: OperationsResource): void {
    this.selectedResource = resource;
    this.refresh();
  }

  selectAction(): void {
    this.payloadText = JSON.stringify(this.selectedAction.sample, null, 2);
    this.draftValues = Object.entries(this.selectedAction.sample)
      .filter(([, value]) => value === null || ['string', 'number', 'boolean'].includes(typeof value))
      .reduce<Record<string, string>>((values, [key, value]) => {
        values[key] = value === null ? '' : String(value);
        return values;
      }, {});
    this.actionFields = Object.entries(this.selectedAction.sample)
      .filter(([, value]) => value === null || ['string', 'number', 'boolean'].includes(typeof value))
      .filter(([key]) => key !== 'customPath')
      .map(([key, value]) => ({
        key,
        label: this.fieldLabel(key),
        type: this.fieldType(key, value),
        required: ['unitId', 'visitorName', 'token', 'parkingSpotId', 'machineId', 'scheduledStart', 'scheduledEnd'].includes(key),
      }));
    this.entityId = '';
  }

  rowTitle(row: OperationsRow): string {
    return String(row['title'] ?? row['name'] ?? row['code'] ?? row['visitor_name'] ?? row['status'] ?? row['id']);
  }

  rowSubtitle(row: OperationsRow): string {
    const status = row['status'] ? `Estado: ${String(row['status'])}` : '';
    const id = row['id'] ? `ID: ${String(row['id'])}` : '';
    return [status, id].filter(Boolean).join(' · ');
  }

  execute(): void {
    if (!this.visibleActions.includes(this.selectedAction)) {
      void this.feedback.error('Tu perfil no puede ejecutar esta operación.');
      return;
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(this.payloadText) as Record<string, unknown>;
    } catch {
      void this.feedback.error('El contenido de la operación no es JSON válido.');
      return;
    }

    for (const field of this.actionFields) {
      const original = this.selectedAction.sample[field.key];
      const value = this.draftValues[field.key] ?? '';
      payload[field.key] = typeof original === 'number'
        ? Number(value || 0)
        : typeof original === 'boolean'
          ? value === 'true'
          : value;
    }

    let path = this.selectedAction.path;
    if (this.selectedAction.requiresId) {
      if (!this.entityId.trim()) {
        void this.feedback.error('Indica el ID del registro.');
        return;
      }
      if (path.includes('{customPath}')) {
        const customPath = String(payload['customPath'] ?? '').replace(/^\/+|\/+$/g, '');
        delete payload['customPath'];
        if (!customPath) {
          void this.feedback.error('Indica la ruta del recurso.');
          return;
        }
        path = path.replace('{customPath}', customPath);
      }
      path = path.replace('{id}', this.entityId.trim());
    }

    this.executing = true;
    this.api.execute(this.selectedAction.method, path, payload)
      .pipe(finalize(() => (this.executing = false)))
      .subscribe({
        next: async () => {
          await this.feedback.success('Operación guardada correctamente.');
          this.refresh();
        },
        error: (error) => this.showError(error),
      });
  }

  private showError(error: unknown): void {
    void this.feedback.error(this.auth.getErrorMessage(error));
  }

  private fieldType(key: string, value: unknown): string {
    if (typeof value === 'number') {
      return 'number';
    }
    if (key.toLowerCase().includes('date') || key.endsWith('On')) {
      return 'date';
    }
    if (key.toLowerCase().includes('at') || key.startsWith('valid') || key.startsWith('scheduled')) {
      return 'datetime-local';
    }
    if (key.toLowerCase().includes('phone')) {
      return 'tel';
    }
    return 'text';
  }

  private fieldLabel(key: string): string {
    const labels: Record<string, string> = {
      unitId: 'ID de la unidad', visitorName: 'Nombre de la visita', invitationType: 'Tipo de invitación',
      validFrom: 'Válida desde', validUntil: 'Válida hasta', token: 'Código o token QR', eventType: 'Tipo de evento',
      source: 'Origen', notes: 'Notas', parkingSpotId: 'ID del estacionamiento', vehiclePlate: 'Patente',
      machineId: 'ID de la máquina', scheduledStart: 'Inicio del turno', scheduledEnd: 'Fin del turno',
      tokensDelivered: 'Fichas entregadas', residentId: 'ID del residente', membershipType: 'Tipo de membresía',
      residenceStatus: 'Estado de residencia', emergencyContactName: 'Contacto de emergencia',
      emergencyContactPhone: 'Teléfono de emergencia', validFromDate: 'Vigente desde', carrier: 'Transportista',
      receiverName: 'Persona que retira', method: 'Método', name: 'Nombre', address: 'Dirección',
      description: 'Descripción', status: 'Estado', customPath: 'Ruta del módulo',
    };
    return labels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  }
}
