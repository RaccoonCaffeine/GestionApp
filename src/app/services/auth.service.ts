import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$: Observable<UserProfile | null> = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user);
        this.userSubject.next(userProfile);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async logout() {
    await signOut(this.auth);
  }

  private async getUserProfile(user: User): Promise<UserProfile> {
    const ref = doc(this.firestore, `users/${user.uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : { uid: user.uid, email: user.email || '', role: 'trabajador' };
  }
}
