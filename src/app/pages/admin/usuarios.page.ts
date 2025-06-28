import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonSpinner, IonIcon, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonSpinner,
    CommonModule, ReactiveFormsModule
  ]
})
export class UsuariosPage implements OnInit {
  usuarios: any[] = [];
  loading = false;
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor de Inventario' },
    { value: 'trabajador', label: 'Trabajador' }
  ];

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private toast: ToastService,
    private location: Location
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.usuarios = await this.userService.getAll();
    this.loading = false;
  }

  async cambiarRol(usuario: any, nuevoRol: string) {
    await this.userService.updateRole(usuario.uid, nuevoRol);
    usuario.role = nuevoRol;
    this.toast.present('Rol actualizado', 'success');
  }
    goBack() {
    this.location.back();
  }
}
