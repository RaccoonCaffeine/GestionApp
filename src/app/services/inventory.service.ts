import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, collectionData } from '@angular/fire/firestore';
import { InventoryItem, InventoryMovement, Supplier, Kit } from '../models/inventory.model';
import { Batch } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  /**
   * Agrega un lote (batch) a un ítem existente
   */
  async addBatchToItem(itemId: string, batch: Batch) {
    const itemRef = doc(this.firestore, 'inventory', itemId);
    const itemSnap = await getDocs(collection(this.firestore, 'inventory'));
    let itemData: any = null;
    itemSnap.forEach((docSnap) => {
      if (docSnap.id === itemId) {
        itemData = { id: docSnap.id, ...docSnap.data() };
      }
    });
    if (!itemData) throw new Error('Ítem no encontrado');
    const batches = itemData.batches ? [...itemData.batches, batch] : [batch];
    await updateDoc(itemRef, { batches });
  }

  /**
   * Actualiza un lote específico de un ítem
   */
  async updateBatch(itemId: string, batchId: string, batchUpdate: Partial<Batch>) {
    const itemRef = doc(this.firestore, 'inventory', itemId);
    const itemSnap = await getDocs(collection(this.firestore, 'inventory'));
    let itemData: any = null;
    itemSnap.forEach((docSnap) => {
      if (docSnap.id === itemId) {
        itemData = { id: docSnap.id, ...docSnap.data() };
      }
    });
    if (!itemData || !itemData.batches) throw new Error('Ítem o lotes no encontrados');
    const batches = itemData.batches.map((batch: any) => batch.id === batchId ? { ...batch, ...batchUpdate } : batch);
    await updateDoc(itemRef, { batches });
  }

  /**
   * Elimina un lote específico de un ítem
   */
  async deleteBatch(itemId: string, batchId: string) {
    const itemRef = doc(this.firestore, 'inventory', itemId);
    const itemSnap = await getDocs(collection(this.firestore, 'inventory'));
    let itemData: any = null;
    itemSnap.forEach((docSnap) => {
      if (docSnap.id === itemId) {
        itemData = { id: docSnap.id, ...docSnap.data() };
      }
    });
    if (!itemData || !itemData.batches) throw new Error('Ítem o lotes no encontrados');
    const batches = itemData.batches.filter((batch: any) => batch.id !== batchId);
    await updateDoc(itemRef, { batches });
  }
  constructor(private firestore: Firestore) {}

  /**
   * Observable en tiempo real de alertas de stock bajo
   */
  getStockAlerts$() {
    const col = collection(this.firestore, 'inventory');
    // idField: 'id' para incluir el id del documento
    return collectionData(col, { idField: 'id' }) as any;
  }

  getItems() {
    return getDocs(collection(this.firestore, 'inventory'));
  }

  addItem(item: InventoryItem) {
    return addDoc(collection(this.firestore, 'inventory'), item);
  }

  updateItem(id: string, item: Partial<InventoryItem>) {
    return updateDoc(doc(this.firestore, 'inventory', id), item);
  }

  deleteItem(id: string) {
    return deleteDoc(doc(this.firestore, 'inventory', id));
  }

  // Movements
  addMovement(movement: InventoryMovement) {
    return addDoc(collection(this.firestore, 'movements'), movement);
  }

  getMovementsByItem(itemId: string) {
    return getDocs(query(collection(this.firestore, 'movements'), where('itemId', '==', itemId)));
  }

  getMovementsByDateRange(startDate: string, endDate: string) {
    // Asume que el campo 'date' es un string ISO
    return getDocs(query(
      collection(this.firestore, 'movements'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    ));
  }

  // Suppliers
  getSuppliers() {
    return getDocs(collection(this.firestore, 'suppliers'));
  }
  addSupplier(supplier: Supplier) {
    return addDoc(collection(this.firestore, 'suppliers'), supplier);
  }

  // Kits
  getKits() {
    return getDocs(collection(this.firestore, 'kits'));
  }
  addKit(kit: Kit) {
    return addDoc(collection(this.firestore, 'kits'), kit);
  }

  /**
   * Registra un movimiento y actualiza el stock del ítem correspondiente.
   * Suma/resta según tipo: entrada/devolución suma, salida/uso/transferencia resta.
   */
  async addMovementAndUpdateStock(movement: InventoryMovement) {
    // 1. Registrar movimiento
    await this.addMovement({ ...movement, date: new Date().toISOString() });
    // 2. Obtener ítem actual
    const itemRef = doc(this.firestore, 'inventory', movement.itemId);
    const itemSnap = await getDocs(collection(this.firestore, 'inventory'));
    let itemData = null as InventoryItem | null;
    itemSnap.forEach((docSnap) => {
      if (docSnap.id === movement.itemId) {
        itemData = { id: docSnap.id, ...docSnap.data() } as InventoryItem;
      }
    });
    if (!itemData) throw new Error('Ítem no encontrado');
    let batches: Batch[] = Array.isArray(itemData.batches) ? [...itemData.batches] : [];

    // ENTRADA o DEVOLUCIÓN
    if (movement.type === 'entrada' || movement.type === 'devolucion') {
      if (movement.batchId === 'new' || batches.length === 0) {
        // Crear lote nuevo
        const newBatch: Batch = {
          id: Math.random().toString(36).substring(2, 12),
          lotNumber: 'Lote-' + new Date().getTime(),
          quantity: movement.quantity,
          expirationDate: (movement as any).expirationDate,
          price: (movement as any).price ?? 0,
          createdAt: new Date().toISOString(),
          supplierId: (movement as any).supplierId ?? itemData.supplierId ?? ''
        };
        batches.push(newBatch);
      } else {
        // Sumar cantidad al lote seleccionado
        const batch = batches.find(b => b.id === movement.batchId);
        if (!batch) throw new Error('Lote seleccionado no existe');
        batch.quantity += movement.quantity;
      }
    }
    // SALIDA, USO, TRANSFERENCIA
    else if (movement.type === 'salida' || movement.type === 'uso' || movement.type === 'transferencia') {
      const batch = batches.find(b => b.id === movement.batchId);
      if (!batch) throw new Error('Lote seleccionado no existe');
      if (batch.quantity < movement.quantity) throw new Error('No hay suficiente stock en el lote seleccionado');
      batch.quantity -= movement.quantity;
    }
    await updateDoc(itemRef, { batches });
  }

  async getStockAlerts() {
    const snap = await this.getItems();
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))
      .filter((item) => {
        const totalStock = item.batches ? item.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) : 0;
        return item.minStock !== undefined && totalStock <= item.minStock;
      });
  }

  /**
   * Marca una alerta como leída (puedes implementar persistencia en Firestore si lo deseas)
   */
  async marcarAlertaLeida(id: string) {
    // Aquí solo simula, pero podrías actualizar un campo en Firestore
    return Promise.resolve();
  }
}
