import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertasPopoverTriggerComponent } from '../../shared/alertas-popover-trigger.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    CommonModule, RouterModule, AlertasPopoverTriggerComponent
  ],
})
export class HomePage {
  menuOptions = [
    { label: 'Inventario', icon: 'cube-outline', route: '/inventario', roles: ['admin', 'gestor', 'trabajador'] },
    { label: 'Movimientos', icon: 'swap-horizontal-outline', route: '/movimientos', roles: ['admin', 'gestor'] },
    { label: 'Reportes', icon: 'document-text-outline', route: '/reportes', roles: ['admin', 'gestor'] },
    { label: 'Admin Usuarios', icon: 'shield-checkmark-outline', route: '/admin-usuarios', roles: ['admin'] }
  ];

  constructor(public auth: AuthService, private toast: ToastService) {}

  filteredMenuOptions(user: any) {
    return this.menuOptions.filter(opt => opt.roles.includes(user.role));
  }

  async logout() {
    await this.auth.logout();
    this.toast.present('Sesión cerrada', 'primary');
    // Redirect to login page after logout
    window.location.href = '/login';
  }
}
