import { IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronUp, chevronDown, arrowBack } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
// ...existing code...
// Cleaned up duplicate imports and class declarations
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { KitService } from '../../services/kit.service';
import { InventoryService } from '../../services/inventory.service';
import { Kit, InventoryItem } from '../../models/inventory.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonAlert } from '@ionic/angular/standalone';
import { IonCheckbox } from '@ionic/angular/standalone';

@Component({
  selector: 'app-kit',
  templateUrl: './kit.page.html',
  styleUrls: ['./kit.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
        IonCheckbox,
        IonCard,
        IonCardHeader,
        IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButtons
  ]
})
export class KitPage implements OnInit {
  constructor(
    private kitService: KitService,
    private inventoryService: InventoryService,
    private alertController: AlertController
  ) {
    addIcons({ chevronUp, chevronDown, arrowBack });
  }
  get expandedKit(): Kit | undefined {
    return this.kits.find(k => k.id === this.expandedKitId);
  }
  get kitTotalPages(): number {
    return Math.ceil(this.filteredItems.length / 8);
  }
  kitPage: number = 1;
  expandedKitId: string = '';
  toggleKitDetails(id?: string) {
    if (!id) return;
    this.expandedKitId = this.expandedKitId === id ? '' : id;
  }
  goBack() {
    window.history.back();
  }
  pinnedItems: Set<string> = new Set();
  togglePinItem(itemId: string | undefined) {
    if (!itemId) return;
    if (this.pinnedItems.has(itemId)) {
      this.pinnedItems.delete(itemId);
    } else {
      this.pinnedItems.add(itemId);
    }
  }
  kits: Kit[] = [];
  items: InventoryItem[] = [];
  newKit: Kit = { name: '', items: [] };
  selectedItems: { [itemId: string]: number } = {};
  loading = false;

  // ...existing code...

  async ngOnInit() {
    const kitSnap = await this.kitService.getKits();
    this.kits = kitSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Kit[];
    const itemSnap = await this.inventoryService.getItems();
    this.items = itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
  }

  searchTerm: string = '';
  kitToDelete: string | null = null;

  get filteredItems(): InventoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.items;
    // Siempre mostrar los items "pineados" aunque no coincidan con la búsqueda
    const filtered = this.items.filter(item =>
      item.description.toLowerCase().includes(term) ||
      (item.id ? item.id.toLowerCase().includes(term) : false)
    );
    const pinned = this.items.filter(item => item.id && this.pinnedItems.has(item.id));
    // Unir los pineados y los filtrados, sin duplicados
    const all = [...pinned, ...filtered.filter(item => !item.id || !this.pinnedItems.has(item.id))];
    return all;
  }

  // Calcula el stock actual de un item sumando los lotes activos
  // Calcula el stock actual de un item sumando los batches activos
  getItemStock(itemId: string): number {
    const item = this.items.find(i => i.id === itemId);
    if (!item || !item.batches || !Array.isArray(item.batches)) return 0;
    const now = new Date();
    return item.batches
      .filter((batch: any) => batch.quantity > 0 && (!batch.expirationDate || new Date(batch.expirationDate) > now))
      .reduce((acc: number, batch: any) => acc + batch.quantity, 0);
  }

  addKit() {
    if (!this.newKit.name) return;
    const itemsArr = Object.entries(this.selectedItems)
      .filter(([_, qty]) => qty && qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity: Number(quantity) }));
    if (itemsArr.length === 0) return;
    this.loading = true;
    this.newKit.items = itemsArr;
    this.kitService.addKit(this.newKit).then(() => {
      this.loading = false;
      this.newKit = { name: '', items: [] };
      this.selectedItems = {};
      this.ngOnInit();
    });
  }

  // Eliminado constructor duplicado

  async confirmDeleteKit(id?: string) {
    if (!id) return;
    this.kitToDelete = id;
    const alert = await this.alertController.create({
      header: '¿Eliminar Kit?',
      message: '¿Está seguro que desea eliminar este kit? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.kitToDelete = null;
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteKitConfirmed();
          }
        }
      ]
    });
    await alert.present();
  }

  deleteKitConfirmed() {
    if (!this.kitToDelete) return;
    this.kitService.deleteKit(this.kitToDelete).then(() => {
      this.kitToDelete = null;
      this.ngOnInit();
    });
  }

  // deleteKit replaced by confirmDeleteKit, deleteKitConfirmed, cancelDeleteKit

  getItemName(itemId: string): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.description : itemId;
  }

  getSelectedItem(itemId: string): number | '' {
    return this.selectedItems[itemId] ?? '';
  }

  setSelectedItem(itemId: string, value: any): void {
    this.selectedItems[itemId] = value ? Number(value) : 0;
  }
}
