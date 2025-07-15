import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { InventoryService } from '../../services/inventory.service';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
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
export class HomePage implements OnInit, OnDestroy {
  menuOptions = [
    { label: 'Inventario', icon: 'cube-outline', route: '/inventario', roles: ['admin', 'gestor', 'trabajador'] },
    { label: 'Movimientos', icon: 'swap-horizontal-outline', route: '/movimientos', roles: ['admin', 'gestor'] },
    { label: 'Historial de Precios', icon: 'pricetag-outline', route: '/precio-historial', roles: ['admin', 'gestor'] },
    { label: 'Kits y Conjuntos', icon: 'construct-outline', route: '/kits', roles: ['admin', 'gestor'] },
    { label: 'Reportes', icon: 'document-text-outline', route: '/reportes', roles: ['admin', 'gestor'] },
    { label: 'Admin Usuarios', icon: 'shield-checkmark-outline', route: '/admin-usuarios', roles: ['admin'] }
  ];

  userRole: string | null = null;
  private alertsChecked = false;

  constructor(
    public auth: AuthService,
    private toast: ToastService,
    private inventory: InventoryService,
    private platform: Platform
  ) {}

  filteredMenuOptions(user: any) {
    return this.menuOptions.filter(opt => opt.roles.includes(user.role));
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.userRole = user?.role || null;
      // Solo mostrar toast una vez por entrada a la página
      if (!this.alertsChecked) {
        this.checkAlerts();
        this.alertsChecked = true;
      }
    });
  }

  async checkAlerts() {
    try {
      const itemsSnap = await this.inventory.getItems();
      const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      let alertCount = 0;
      items.forEach((item: any) => {
        const batches: any[] = item.batches || [];
        const totalStock = batches.reduce((sum: number, batch: any) => sum + (batch.quantity || 0), 0);
        if (typeof item.minStock !== 'undefined' && totalStock <= item.minStock * 0.8) {
          alertCount++;
        }
        batches.forEach((batch: any) => {
          if (batch.expirationDate) {
            const diasRestantes = Math.ceil((new Date(batch.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (diasRestantes <= 30) {
              alertCount++;
            }
          }
        });
      });
      if (alertCount > 0) {
        this.toast.present(`Tienes ${alertCount} ítem(s) con notificaciones pendientes`, 'warning');
      }
    } catch (e) {
      // Silenciar errores de alertas
    }
  }

  // ...elimina método listenStockAlerts...

  ngOnDestroy() {}

  async logout() {
    await this.auth.logout();
    this.toast.present('Sesión cerrada', 'primary');
    window.location.href = '/login';
  }
}
