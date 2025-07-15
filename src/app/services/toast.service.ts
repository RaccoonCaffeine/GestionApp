import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private toastController: ToastController) {}

  async present(message: string, color: string = 'primary', opts?: { position?: 'top'|'bottom'|'middle', cssClass?: string, duration?: number }) {
    const toast = await this.toastController.create({
      message,
      duration: opts?.duration ?? 4000,
      color,
      position: opts?.position ?? 'top',
      cssClass: opts?.cssClass ?? 'custom-toast',
    });
    toast.present();
  }
}
