import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private firestore: Firestore) {}

  async getInventoryReport() {
    const snapshot = await getDocs(collection(this.firestore, 'inventory'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getMovementsReport() {
    const snapshot = await getDocs(collection(this.firestore, 'movements'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
