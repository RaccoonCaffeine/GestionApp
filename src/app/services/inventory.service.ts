import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, collectionData } from '@angular/fire/firestore';
import { InventoryItem, InventoryMovement, Supplier, Kit } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
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
    let currentStock = 0;
    let found = false;
    itemSnap.forEach((docSnap) => {
      if (docSnap.id === movement.itemId) {
        const itemData = docSnap.data() as InventoryItem;
        currentStock = itemData.stock || 0;
        found = true;
      }
    });
    if (!found) throw new Error('Ítem no encontrado');
    // 3. Calcular nuevo stock
    let newStock = currentStock;
    if (movement.type === 'entrada' || movement.type === 'devolucion') {
      newStock += movement.quantity;
    } else if (movement.type === 'salida' || movement.type === 'uso' || movement.type === 'transferencia') {
      newStock -= movement.quantity;
      if (newStock < 0) newStock = 0;
    }
    // 4. Actualizar stock
    await updateDoc(itemRef, { stock: newStock });
  }

  async getStockAlerts() {
    const snap = await this.getItems();
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.stock !== undefined && item.minStock !== undefined && item.stock <= item.minStock);
  }

  /**
   * Marca una alerta como leída (puedes implementar persistencia en Firestore si lo deseas)
   */
  async marcarAlertaLeida(id: string) {
    // Aquí solo simula, pero podrías actualizar un campo en Firestore
    return Promise.resolve();
  }
}
