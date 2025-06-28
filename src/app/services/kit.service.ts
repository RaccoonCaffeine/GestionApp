import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Kit } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class KitService {
  constructor(private firestore: Firestore) {}

  getKits() {
    return getDocs(collection(this.firestore, 'kits'));
  }

  addKit(kit: Kit) {
    return addDoc(collection(this.firestore, 'kits'), kit);
  }

  updateKit(id: string, kit: Partial<Kit>) {
    return updateDoc(doc(this.firestore, 'kits', id), kit);
  }

  deleteKit(id: string) {
    return deleteDoc(doc(this.firestore, 'kits', id));
  }
}
