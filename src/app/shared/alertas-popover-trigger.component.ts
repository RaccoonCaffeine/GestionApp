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
      // Normaliza fechas a solo día (sin horas)
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const soon = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
      let alertas: any[] = [];
      for (const item of items) {
        // Calcular stock por lotes
        const batches = item.batches || [];
        const stock = batches.reduce((sum: number, batch: any) => sum + (batch.quantity || 0), 0);
        // Stock bajo (<= 80% del mínimo)
        if (item.minStock && stock / item.minStock <= 0.8) {
          alertas.push({
            type: 'stock',
            description: item.description,
            stock,
            minStock: item.minStock,
            id: item.id
          });
        }
        // Lotes próximos a vencer
        for (const batch of batches) {
          if (batch.expirationDate) {
            let exp: Date;
            if (/^\d{4}-\d{2}-\d{2}$/.test(batch.expirationDate)) {
              const [year, month, day] = batch.expirationDate.split('-').map(Number);
              exp = new Date(year, month - 1, day);
            } else {
              exp = new Date(batch.expirationDate);
            }
            exp.setHours(0,0,0,0);
            if (exp.getTime() >= hoy.getTime() && exp.getTime() <= soon.getTime()) {
              const diasRestantes = Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              alertas.push({
                type: 'vencimiento',
                description: item.description,
                lotNumber: batch.lotNumber,
                expirationDate: exp.toLocaleDateString(),
                diasRestantes,
                id: item.id + '-' + batch.lotNumber
              });
            }
          }
        }
      }
      // Elimina duplicados por id
      const uniqueAlertas = Object.values(
        alertas.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {})
      );
      this.alertas = uniqueAlertas;
      this.unread = uniqueAlertas.length;
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
