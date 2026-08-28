import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../../core/auth/auth.models';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { Booking } from '../../../bookings/models/booking.models';
import { BookingsApiService } from '../../../bookings/services/bookings-api.service';
import { Conversation } from '../../../messaging/models/messaging.models';
import { MessagingApiService } from '../../../messaging/services/messaging-api.service';
import { NotificationItem } from '../../../notifications/models/notification.models';
import { NotificationsApiService } from '../../../notifications/services/notifications-api.service';
import { PackageItem, PackagePickupAuthorization } from '../../../packages/models/package.models';
import { PackagesApiService } from '../../../packages/services/packages-api.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { Visit } from '../../../visits/models/visit.models';
import { VisitsApiService } from '../../../visits/services/visits-api.service';

@Component({
  selector: 'app-resident-dashboard',
  templateUrl: './resident-dashboard.page.html',
  styleUrls: ['./resident-dashboard.page.scss'],
  standalone: false,
})
export class ResidentDashboardPage {
  readonly authService = inject(AuthService);
  readonly notificationsApiService = inject(NotificationsApiService);
  private readonly authorization = inject(AuthorizationService);
  private readonly alertController = inject(AlertController);
  private readonly feedbackService = inject(FeedbackService);
  private readonly bookingsApiService = inject(BookingsApiService);
  private readonly messagingApiService = inject(MessagingApiService);
  private readonly packagesApiService = inject(PackagesApiService);
  private readonly visitsApiService = inject(VisitsApiService);

  loading = true;
  refreshError = false;
  bookings: Booking[] = [];
  conversations: Conversation[] = [];
  notifications: NotificationItem[] = [];
  visits: Visit[] = [];
  packages: PackageItem[] = [];
  pickupAuthorizations: PackagePickupAuthorization[] = [];

  get canUseCommunityServices(): boolean {
    return this.authorization.hasAnyPermission([
      PERMISSIONS.ACCESS_REQUEST,
      PERMISSIONS.PARKING_SESSIONS_REQUEST,
      PERMISSIONS.LAUNDRY_REQUEST,
      PERMISSIONS.RESIDENTS_MEMBERSHIP_REQUEST,
      PERMISSIONS.PACKAGES_PICKUP_REQUEST,
    ]);
  }

  get canRequestPackagePickup(): boolean {
    return this.authorization.hasPermission(PERMISSIONS.PACKAGES_PICKUP_REQUEST);
  }

  get upcomingBookings(): Booking[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings
      .filter((booking) =>
        !['CANCELADA', 'COMPLETADA'].includes(booking.status)
        && booking.bookingDate >= today,
      )
      .sort((left, right) =>
        `${left.bookingDate}T${left.startTime}`.localeCompare(
          `${right.bookingDate}T${right.startTime}`,
        ),
      )
      .slice(0, 3);
  }

  get unreadMessages(): number {
    return this.conversations.reduce(
      (total, conversation) => total + conversation.unreadCount,
      0,
    );
  }

  get pendingPackages(): PackageItem[] {
    return this.packages
      .filter((item) => !['ENTREGADA', 'CANCELADA'].includes(item.status))
      .slice(0, 3);
  }

  get activeVisits(): Visit[] {
    return this.visits
      .filter((visit) => !['FINALIZADA', 'CANCELADA'].includes(visit.status))
      .slice(0, 3);
  }

  ionViewWillEnter(): void {
    this.loadDashboard();
  }

  loadDashboard(event?: Event): void {
    this.loading = !event;
    this.refreshError = false;

    forkJoin({
      bookings: this.bookingsApiService.list().pipe(
        catchError(() => {
          this.refreshError = true;
          return of([]);
        }),
      ),
      conversations: this.messagingApiService.listConversations().pipe(
        catchError(() => {
          this.refreshError = true;
          return of([]);
        }),
      ),
      notifications: this.notificationsApiService.list().pipe(
        catchError(() => {
          this.refreshError = true;
          return of([]);
        }),
      ),
      visits: this.visitsApiService.list().pipe(
        catchError(() => {
          this.refreshError = true;
          return of([]);
        }),
      ),
      packages: this.packagesApiService.list().pipe(
        catchError(() => {
          this.refreshError = true;
          return of([]);
        }),
      ),
      pickupAuthorizations: this.canRequestPackagePickup
        ? this.packagesApiService.listPickupAuthorizations().pipe(catchError(() => of([])))
        : of([]),
    }).subscribe({
      next: ({ bookings, conversations, notifications, visits, packages, pickupAuthorizations }) => {
        this.bookings = bookings;
        this.conversations = conversations;
        this.notifications = notifications;
        this.visits = visits;
        this.packages = packages;
        this.pickupAuthorizations = pickupAuthorizations;
        this.notificationsApiService.unreadCount.set(
          notifications.filter((item) => !item.read).length,
        );
        this.loading = false;
        (event?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
    });
  }

  get activePickupAuthorizations(): PackagePickupAuthorization[] {
    return this.pickupAuthorizations.filter((authorization) => !authorization.revoked_at);
  }

  async requestPickupCode(packageItem: PackageItem): Promise<void> {
    if (!this.canRequestPackagePickup) {
      return;
    }
    const user = this.authService.currentUser();
    const alert = await this.alertController.create({
      header: 'Autorizar retiro',
      subHeader: packageItem.description,
      message: 'Genera un código temporal para que conserjería valide el retiro. Vence en 4 horas.',
      inputs: [
        { name: 'personName', type: 'text', value: [user?.firstName, user?.lastName].filter(Boolean).join(' '), placeholder: 'Nombre de quien retira' },
        { name: 'document', type: 'text', placeholder: 'RUT o documento (opcional)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Generar código',
          handler: (value) => {
            const authorizedPersonName = String(value.personName ?? '').trim();
            if (!authorizedPersonName) {
              void this.feedbackService.error('Indica quién retirará la encomienda.');
              return false;
            }
            this.packagesApiService.createPickupCode({
              packageId: packageItem.id,
              authorizedPersonName,
              authorizedPersonDocument: String(value.document ?? '').trim() || null,
              authorizationType: 'SINGLE',
            }).subscribe({
              next: async (code) => {
                const codeAlert = await this.alertController.create({
                  header: 'Código temporal de retiro',
                  message: `Preséntalo en conserjería antes de las ${new Date(code.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                  inputs: [{ name: 'token', type: 'textarea', value: code.token }],
                  buttons: ['Listo'],
                });
                await codeAlert.present();
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

  revokePickupAuthorization(authorization: PackagePickupAuthorization): void {
    this.packagesApiService.revokePickupAuthorization(authorization.id).subscribe({
      next: async () => {
        await this.feedbackService.success('Autorización revocada.');
        this.loadDashboard();
      },
      error: async (error) => this.feedbackService.error(this.authService.getErrorMessage(error)),
    });
  }
}
