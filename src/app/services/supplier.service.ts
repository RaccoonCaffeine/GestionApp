import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Supplier } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  constructor(private firestore: Firestore) {}

  getSuppliers() {
    return getDocs(collection(this.firestore, 'suppliers'));
  }

  addSupplier(supplier: Supplier) {
    return addDoc(collection(this.firestore, 'suppliers'), supplier);
  }

  updateSupplier(id: string, supplier: Partial<Supplier>) {
    return updateDoc(doc(this.firestore, 'suppliers', id), supplier);
  }

  deleteSupplier(id: string) {
    return deleteDoc(doc(this.firestore, 'suppliers', id));
  }
}
