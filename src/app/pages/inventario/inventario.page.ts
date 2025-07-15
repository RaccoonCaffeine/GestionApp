import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { InventoryItem, Batch } from '../../models/inventory.model';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonButtons, AlertController, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonButtons,
    CommonModule, ReactiveFormsModule, FormsModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class InventarioPage implements OnInit {
  filterCategory: string = '';
  filterTag: string = '';

  verLotes(item: InventoryItem) {
    this.router.navigate(['/lotes'], { state: { item } });
  }
  // ...existing code...
  batchForm: FormGroup = this.fb.group({
    lotNumber: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    expirationDate: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    supplierId: ['']
  });
  batchEditing: { item: InventoryItem, batch?: Batch } | null = null;

  toggleBatches(item: InventoryItem) {
    this.expandedItemId = this.expandedItemId === item.id ? null : (item.id ?? null);
  }

  openAddBatch(item: InventoryItem) {
    this.batchEditing = { item };
    this.batchForm.reset({
      lotNumber: '',
      quantity: 0,
      expirationDate: '',
      price: 0,
      supplierId: ''
    });
  }

  async saveBatch() {
    if (!this.batchEditing) return;
    // Permitir si ya existe fecha en el batch original o en el formulario
    const hasExpiration = this.batchForm.value.expirationDate || (this.batchEditing.batch && this.batchEditing.batch.expirationDate);
    if (!hasExpiration) {
      this.toast.present('Debes ingresar una fecha de vencimiento para el lote.', 'danger');
      return;
    }
    const batch: Batch = {
      ...this.batchForm.value,
      expirationDate: this.batchForm.value.expirationDate || (this.batchEditing.batch ? this.batchEditing.batch.expirationDate : ''),
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await this.inventory.addBatchToItem(this.batchEditing.item.id!, batch);
    this.batchEditing = null;
    await this.loadItems();
  }

  editBatch(item: InventoryItem, batch: Batch) {
    this.batchEditing = { item, batch };
    this.batchForm.patchValue(batch);
  }

  async saveBatchEdit() {
    if (!this.batchEditing || !this.batchEditing.batch) return;
    // Permitir si ya existe fecha en el batch original o en el formulario
    const hasExpiration = this.batchForm.value.expirationDate || this.batchEditing.batch.expirationDate;
    if (!hasExpiration) {
      this.toast.present('Debes ingresar una fecha de vencimiento para el lote.', 'danger');
      return;
    }
    const updateData = {
      ...this.batchForm.value,
      expirationDate: this.batchForm.value.expirationDate || this.batchEditing.batch.expirationDate
    };
    await this.inventory.updateBatch(this.batchEditing.item.id!, this.batchEditing.batch.id!, updateData);
    this.batchEditing = null;
    await this.loadItems();
  }

  async deleteBatch(item: InventoryItem, batch: Batch) {
    await this.inventory.deleteBatch(item.id!, batch.id!);
    await this.loadItems();
  }
  items: InventoryItem[] = [];
  form: FormGroup;
  loading = false;
  editingId: string | null = null;
  showAddForm: boolean = false;
  expandedItemId: string | null = null;
  movimientosPorItem: { [itemId: string]: any[] } = {};

  filterText: string = '';
  filterMovsForm: FormGroup = this.fb.group({ start: [''], end: [''] });
  userRole: string | null = null;

  // Calcula el stock total sumando los lotes
  getItemStock(item: InventoryItem): number {
    if (!item.batches) return 0;
    return item.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
  }

  constructor(
    private inventory: InventoryService,
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private location: Location,
    private alertCtrl: AlertController,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      serialNumber: ['', Validators.required],
      location: ['', Validators.required],
      category: [''],
      tags: [''],
      minStock: [0, [Validators.required, Validators.min(0)]]
      // No se incluye stock, se calcula por lotes
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async ngOnInit() {
    // Obtener rol desde AuthService si está disponible
    this.auth.user$.subscribe(user => {
      this.userRole = user?.role || null;
    });
    this.initDateFilters();
    await this.loadItems();
    // No mostrar toast de notificaciones en inventario
    // await this.checkNotifications();
  }
  // Notificaciones pendientes
  notifications: string[] = [];

  // Verifica notificaciones de stock bajo y lotes próximos a vencer
  async checkNotifications() {
    this.notifications = [];
    const today = new Date();
    const soon = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días adelante
    let itemsConNotificacion = 0;
    for (const item of this.items) {
      let tieneNotificacion = false;
      // Stock bajo: si el stock es menor o igual al 80% del mínimo
      const stock = this.getItemStock(item);
      const minStock = item.minStock || 0;
      if (minStock > 0) {
        const ratio = stock / minStock;
        if (ratio <= 0.8) {
          this.notifications.push(`Stock bajo: ${item.description} (stock: ${stock}, mínimo: ${minStock}, ${(ratio * 100).toFixed(1)}%)`);
          tieneNotificacion = true;
        }
      }
      // Lotes próximos a vencer (puede haber varios por ítem)
      if (item.batches && item.batches.length) {
        const lotesVencen = item.batches.filter(batch => {
          if (batch.expirationDate) {
            // Normaliza la fecha para evitar problemas de zona horaria
            const exp = new Date(batch.expirationDate + 'T00:00:00');
            return exp.getTime() >= today.getTime() && exp.getTime() <= soon.getTime();
          }
          return false;
        });
        for (const batch of lotesVencen) {
          this.notifications.push(`Lote próximo a vencer: ${item.description} - Lote ${batch.lotNumber} (vence: ${new Date(batch.expirationDate + 'T00:00:00').toLocaleDateString()})`);
          tieneNotificacion = true;
        }
      }
      if (tieneNotificacion) itemsConNotificacion++;
    }
    if (itemsConNotificacion > 0) {
      this.toast.present(
        `Tienes ${itemsConNotificacion} ítem(s) con notificaciones pendientes`,
        'warning',
        { position: 'top', cssClass: 'custom-toast', duration: 6000 }
      );
    }
  }

  initDateFilters() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterMovsForm.patchValue({
      start: firstDay.toISOString().substring(0, 10),
      end: lastDay.toISOString().substring(0, 10)
    });
  }

  page = 1;
  pageSize = 15;
  get filteredItems() {
    let filtered = this.items;
    const term = this.filterText?.trim().toLowerCase() || '';
    if (term) {
      filtered = filtered.filter(i =>
        i.description.toLowerCase().includes(term) ||
        (i.category || '').toLowerCase().includes(term) ||
        (i.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }
    return filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }
  get totalPages() {
    let filtered = !this.filterText
      ? this.items
      : this.items.filter(i => i.description.toLowerCase().includes(this.filterText.toLowerCase()));
    return Math.ceil(filtered.length / this.pageSize) || 1;
  }
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
  }
  nextPage() { this.goToPage(this.page + 1); }
  prevPage() { this.goToPage(this.page - 1); }
  resetPage() { this.page = 1; }

  async loadItems() {
    const snap = await this.inventory.getItems();
    this.items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem);
  }

  async save() {
    if (this.userRole === 'trabajador') return;
    if (this.form.invalid) return;
    this.loading = true;
    try {
      // Procesar tags como array
      const raw = this.form.value;
      const tagsArr = raw.tags ? raw.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
      const itemData = { ...raw, tags: tagsArr };
      if (this.editingId) {
        await this.inventory.updateItem(this.editingId, itemData);
        this.toast.present('Actualizado', 'success');
      } else {
        // Al crear un ítem, inicializa batches vacío
        await this.inventory.addItem({ ...itemData, batches: [] });
        this.toast.present('Agregado', 'success');
      }
      this.form.reset();
      this.editingId = null;
      this.showAddForm = false;
      await this.loadItems();
    } catch (e) {
      this.toast.present('Error al guardar', 'danger');
    }
    this.loading = false;
  }

  edit(item: InventoryItem) {
    if (this.userRole === 'trabajador') return;
    // No se edita batches desde el formulario principal
    this.form.patchValue(item);
    this.editingId = item.id || null;
    this.showAddForm = true;
  }

  async delete(item: InventoryItem) {
    if (this.userRole === 'trabajador') return;
    if (!item.id) return;
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el ítem <b>${item.description}</b>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.inventory.deleteItem(item.id!);
            this.toast.present('Eliminado', 'success');
            await this.loadItems();
          }
        }
      ]
    });
    await alert.present();
  }

  cancel() {
    if (this.userRole === 'trabajador') return;
    this.form.reset();
    this.editingId = null;
    this.showAddForm = false;
  }

  async toggleMovimientos(item: InventoryItem) {
    if (this.expandedItemId === item.id) {
      this.expandedItemId = null;
      return;
    }
    this.expandedItemId = item.id || null;
    await this.loadMovimientosPorItem(item.id!);
  }

  async loadMovimientosPorItem(itemId: string) {
    const start = this.filterMovsForm.value.start + 'T00:00:00.000Z';
    const end = this.filterMovsForm.value.end + 'T23:59:59.999Z';
    const snap = await this.inventory.getMovementsByDateRange(start, end);
    this.movimientosPorItem[itemId] = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((mov: any) => mov.itemId === itemId);
  }

  onMovsFilterChange(item: InventoryItem) {
    this.loadMovimientosPorItem(item.id!);
  }
}
