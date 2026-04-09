import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly toastController = inject(ToastController);

  async success(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color: 'success',
      position: 'top',
    });

    await toast.present();
  }

  async error(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2800,
      color: 'danger',
      position: 'top',
    });

    await toast.present();
  }
}
