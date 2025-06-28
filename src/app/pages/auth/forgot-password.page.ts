import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonButtons, IonIcon,
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class ForgotPasswordPage {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private toast: ToastService,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  goBack() {
    this.location.back();
  }

  async reset() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      await sendPasswordResetEmail(this.auth, this.form.value.email);
      this.toast.present('Correo de recuperación enviado', 'success');
      this.router.navigate(['/login']);
    } catch (e) {
      this.toast.present('Error al enviar correo', 'danger');
    }
    this.loading = false;
  }
}
