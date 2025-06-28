import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner,
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class LoginPage {
  form: FormGroup;
  loading = false;


  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async login() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      await (this.auth as AuthService).login(this.form.value.email, this.form.value.password);
      (this.toast as ToastService).present('Bienvenido', 'success');
      this.router.navigate(['/home']);
    } catch (e) {
      (this.toast as ToastService).present('Credenciales incorrectas', 'danger');
    }
    this.loading = false;
  }
}
