export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'gestor' | 'comprador' | 'logistica' | 'produccion' | 'auditor' | 'proyectos' | 'trabajador';
}

export type UserRole = UserProfile['role'];
