import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private inventory: InventoryService, private auth: AuthService, private location: Location) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.userRole = user?.role || null;
      if (this.userRole && ['admin', 'gestor', 'logistica'].includes(this.userRole)) {
        this.listenStockAlerts();
      }
    });
  }

  listenStockAlerts() {
    if (this.subscription) this.subscription.unsubscribe();
    const col = collection(this.inventory['firestore'], 'inventory');
    this.subscription = collectionData(col, { idField: 'id' })
      .subscribe((items: any[]) => {
        this.loading = true;
        this.alertas = items.filter((item: any) => item.stock !== undefined && item.minStock !== undefined && item.stock <= item.minStock);
        this.loading = false;
      });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  goBack() {
    this.location.back();
  }
}
