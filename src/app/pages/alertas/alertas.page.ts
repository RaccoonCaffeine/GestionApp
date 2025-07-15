import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonButtons, IonButton } from '@ionic/angular/standalone';
import { CommonModule, Location } from '@angular/common';
import { collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonButtons, IonButton,
    CommonModule
  ]
})
export class AlertasPage implements OnInit, OnDestroy {
  alertas: any[] = [];
  loading = false;
  userRole: string | null = null;
  private subscription: Subscription | null = null;
  private willEnterSub: any;

  constructor(
    private inventory: InventoryService,
    private auth: AuthService,
    private location: Location,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.userRole = user?.role || null;
      if (this.userRole && ['admin', 'gestor', 'logistica'].includes(this.userRole)) {
        this.listenStockAlerts(); // Carga alertas inmediatamente
      }
    });
    // Recarga alertas al volver a la página
    this.platform.ready().then(() => {
      document.addEventListener('ionViewWillEnter', this.listenStockAlerts.bind(this));
    });
  }

  listenStockAlerts() {
    if (this.subscription) this.subscription.unsubscribe();
    const col = collection(this.inventory['firestore'], 'inventory');
    this.subscription = collectionData(col, { idField: 'id' })
      .subscribe((items: any[]) => {
        this.loading = true;
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
              // Corrige desfase de fecha por zona horaria
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
        this.loading = false;
        // Ya no se muestra el toast de alerta en inventario
      });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    document.removeEventListener('ionViewWillEnter', this.listenStockAlerts as any);
  }

  goBack() {
    this.location.back();
  }
}
