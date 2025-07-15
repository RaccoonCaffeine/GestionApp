import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory.model';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-precio-historial',
  templateUrl: './precio-historial.page.html',
  styleUrls: ['./precio-historial.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons, IonBackButton,
    CommonModule, FormsModule
  ]
})
export class PrecioHistorialPage implements OnInit {
  items: InventoryItem[] = [];
  selectedItemId: string = '';
  historial: { lote: string, fecha: string, precio: number, proveedor?: string }[] = [];

  constructor(private inventory: InventoryService) {}

  async ngOnInit() {
    const snap = await this.inventory.getItems();
    this.items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem);
  }

  onItemChange() {
    const item = this.items.find(i => i.id === this.selectedItemId);
    if (!item || !item.batches) {
      this.historial = [];
      return;
    }
    this.historial = item.batches.map(batch => ({
      lote: batch.lotNumber,
      fecha: batch.createdAt,
      precio: batch.price,
      proveedor: batch.supplierId
    })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }
}
