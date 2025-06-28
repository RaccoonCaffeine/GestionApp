import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alertas-popover-trigger',
  templateUrl: './alertas-popover-trigger.component.html',
  styleUrls: ['./alertas-popover-trigger.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule]
})
export class AlertasPopoverTriggerComponent implements OnInit, OnDestroy {
  alertas: any[] = [];
  unread = 0;
  userRole: string | null = null;
  private subscription: Subscription | null = null;

  constructor(private inventory: InventoryService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe((user: any) => {
      this.userRole = user?.role || null;
      if (this.userRole && ['admin', 'gestor', 'logistica'].includes(this.userRole)) {
        this.listenStockAlerts();
      } else {
        this.unsubscribe();
        this.alertas = [];
        this.unread = 0;
      }
    });
  }

  listenStockAlerts() {
    this.unsubscribe();
    this.subscription = this.inventory.getStockAlerts$().subscribe((items: any[]) => {
      // Solo alertas activas
      this.alertas = items.filter((item: any) => item.stock !== undefined && item.minStock !== undefined && item.stock <= item.minStock);
      this.unread = this.alertas.length; // Si implementas leídas, cámbialo aquí
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  goToAlertas() {
    this.router.navigate(['/alertas']);
  }

  // Si implementas "leídas", aquí puedes marcar y actualizar el badge
}
