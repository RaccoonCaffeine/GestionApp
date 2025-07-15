import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { InventoryMovement, InventoryItem } from '../../models/inventory.model';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonButtons, IonIcon,
    CommonModule, ReactiveFormsModule, FormsModule
  ]
})
export class MovimientosPage implements OnInit {
  filterText: string = '';

  get filteredMovimientos() {
    if (!this.filterText) return this.movimientos;
    const text = this.filterText.toLowerCase();
    return this.movimientos.filter(mov => {
      const item = this.items.find(i => i.id === mov.itemId);
      return (item?.description?.toLowerCase().includes(text) || mov.itemId?.toLowerCase().includes(text));
    });
  }
  get selectedBatches() {
    const item = this.items.find(i => i.id === this.form?.value?.itemId);
    return item?.batches || [];
  }

  getBatchNumber(batchId: string): string { 
    const batch = this.selectedBatches.find(b => b.id === batchId);
    return batch ? batch.lotNumber : batchId;
  }
  movimientos: InventoryMovement[] = [];
  items: InventoryItem[] = [];
  form: FormGroup;
  filterForm: FormGroup;
  loading = false;
  errorMsg: string = '';

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
      batchId: [''],
      expirationDate: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      supplierId: [''],
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
    // Para entradas, requiere lote y fecha de vencimiento SOLO si es un lote nuevo
    if (this.form.value.type === 'entrada' && this.form.value.batchId === 'new') {
      if (!this.form.value.expirationDate) {
        this.toast.present('Debes ingresar la fecha de vencimiento del lote.', 'danger');
        return;
      }
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.inventory.addMovementAndUpdateStock(this.form.value);
      this.toast.present('Movimiento registrado y stock actualizado', 'success');
      this.form.reset({ type: 'entrada', quantity: 1 });
      await this.loadMovimientos();
      await this.loadItems(); // Refresca el stock en la UI
    } catch (e: any) {
      this.errorMsg = e?.message || e;
      this.toast.present('Error al registrar: ' + (e?.message || e), 'danger');
    }
    this.loading = false;
  }

  getItemName(itemId: string): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.description : itemId;
  }
}
