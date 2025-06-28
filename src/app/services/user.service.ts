import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: Firestore) {}

  async getAll() {
    const usersCol = collection(this.firestore, 'users');
    const snap = await getDocs(usersCol);
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  }

  async updateRole(uid: string, role: string) {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, { role });
  }
}
