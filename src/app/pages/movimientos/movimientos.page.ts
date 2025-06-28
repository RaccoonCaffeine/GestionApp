import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { InventoryMovement, InventoryItem } from '../../models/inventory.model';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonButtons, IonIcon,
    CommonModule, ReactiveFormsModule
  ]
})
export class MovimientosPage implements OnInit {
  movimientos: InventoryMovement[] = [];
  items: InventoryItem[] = [];
  form: FormGroup;
  filterForm: FormGroup;
  loading = false;

  constructor(
    private inventory: InventoryService,
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      itemId: ['', Validators.required],
      type: ['entrada', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
    // Filtro de fechas: por defecto, primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm = this.fb.group({
      start: [firstDay.toISOString().substring(0, 10)],
      end: [lastDay.toISOString().substring(0, 10)]
    });
  }

  goBack() {
    this.location.back();
  }

  async ngOnInit() {
    await this.loadItems();
    await this.loadMovimientos();
  }

  async loadItems() {
    const snap = await this.inventory.getItems();
    this.items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem);
  }

  async loadMovimientos() {
    const start = this.filterForm.value.start + 'T00:00:00.000Z';
    const end = this.filterForm.value.end + 'T23:59:59.999Z';
    const snap = await this.inventory.getMovementsByDateRange(start, end);
    this.movimientos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryMovement);
  }

  onFilterChange() {
    this.loadMovimientos();
  }

  async save() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      // Registrar movimiento y actualizar stock
      await this.inventory.addMovementAndUpdateStock(this.form.value);
      this.toast.present('Movimiento registrado y stock actualizado', 'success');
      this.form.reset({ type: 'entrada', quantity: 1 });
      await this.loadMovimientos();
      await this.loadItems(); // Refresca el stock en la UI
    } catch (e) {
      this.toast.present('Error al registrar', 'danger');
    }
    this.loading = false;
  }

  getItemName(itemId: string): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.description : itemId;
  }
}
