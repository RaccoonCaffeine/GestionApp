import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonButtons, IonIcon,
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class RegisterPage {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private toast: ToastService,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required]
    });
  }

  goBack() {
    this.location.back();
  }

  async register() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, this.form.value.email, this.form.value.password);
      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: this.form.value.email,
        displayName: this.form.value.displayName,
        role: 'trabajador'
      });
      this.toast.present('Registro exitoso', 'success');
      this.router.navigate(['/login']);
    } catch (e) {
      this.toast.present('Error al registrar', 'danger');
    }
    this.loading = false;
  }
}
