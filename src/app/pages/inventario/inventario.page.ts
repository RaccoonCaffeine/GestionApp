import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { InventoryItem } from '../../models/inventory.model';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonButtons, AlertController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonButtons,
    CommonModule, ReactiveFormsModule, FormsModule
  ]
})
export class InventarioPage implements OnInit {
  items: InventoryItem[] = [];
  form: FormGroup;
  loading = false;
  editingId: string | null = null;
  expandedItemId: string | null = null;
  movimientosPorItem: { [itemId: string]: any[] } = {};

  filterText: string = '';
  filterMovsForm: FormGroup = this.fb.group({ start: [''], end: [''] });
  userRole: string | null = null;

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
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  goBack() {
    this.location.back();
  }

  async ngOnInit() {
    // Obtener rol desde AuthService si está disponible
    this.auth.user$.subscribe(user => {
      this.userRole = user?.role || null;
    });
    this.initDateFilters();
    await this.loadItems();
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

  get filteredItems() {
    if (!this.filterText) return this.items;
    return this.items.filter(i => i.description.toLowerCase().includes(this.filterText.toLowerCase()));
  }

  async loadItems() {
    const snap = await this.inventory.getItems();
    this.items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem);
  }

  async save() {
    if (this.userRole === 'trabajador') return;
    if (this.form.invalid) return;
    this.loading = true;
    try {
      if (this.editingId) {
        await this.inventory.updateItem(this.editingId, this.form.value);
        this.toast.present('Actualizado', 'success');
      } else {
        await this.inventory.addItem(this.form.value);
        this.toast.present('Agregado', 'success');
      }
      this.form.reset();
      this.editingId = null;
      await this.loadItems();
    } catch (e) {
      this.toast.present('Error al guardar', 'danger');
    }
    this.loading = false;
  }

  edit(item: InventoryItem) {
    if (this.userRole === 'trabajador') return;
    this.form.patchValue(item);
    this.editingId = item.id || null;
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
