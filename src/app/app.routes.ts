import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

export const routes: Routes = [
  {
    path: 'kits',
    loadComponent: () => import('./pages/kits/kit.page').then((m) => m.KitPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'precio-historial',
    loadComponent: () => import('./pages/precio-historial/precio-historial.page').then((m) => m.PrecioHistorialPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'movimientos',
    loadComponent: () => import('./pages/movimientos/movimientos.page').then((m) => m.MovimientosPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./pages/alertas/alertas.page').then((m) => m.AlertasPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.page').then((m) => m.InventarioPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.page').then((m) => m.ReportesPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'admin-usuarios',
    loadComponent: () => import('./pages/admin/usuarios.page').then((m) => m.UsuariosPage),
    canActivate: [adminGuard], // Mantiene el guard personalizado para roles
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register.page').then((m) => m.RegisterPage),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password.page').then((m) => m.ForgotPasswordPage),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'lotes',
    loadComponent: () => import('./pages/lotes/lotes.page').then((m) => m.LotesPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
