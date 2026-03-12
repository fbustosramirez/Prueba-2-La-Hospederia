
export interface Bed {
  id: string;
  nombre: string;
}

export interface Room {
  id: string;
  nombre: string;
  camas: Bed[];
}

export interface Child {
  id: string;
  internalId: string; // REF-XXXXXX-N
  nombre: string;
  apellido: string;
  rut?: string;
  nacimiento: string;
  nacionalidad: string;
  seAloja: boolean;
  roomId?: string;
  bedId?: string;
}

export interface Guest {
  id: string;
  internalId: string; // REF-XXXXXX
  nombre: string;
  rut?: string; // RUT de la madre
  nacimiento: string; // YYYY-MM-DD
  pais: string;
  ciudad: string;
  causa: string;
  institucionDerivadora: string;
  esRecurrente: boolean;
  tieneHijos: boolean;
  cantidadHijos: number;
  hijosDetalles: Child[];
  fechaIngreso: string; // YYYY-MM-DD
  fechaSalida?: string; // YYYY-MM-DD
  comentarios?: string; // Comentarios para conocer más a la mujer
  notas?: string;
  roomId?: string;
  bedId?: string;
}

export interface Payment {
  id: string;
  guestId: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  esPagado: boolean;
}

export interface Donation {
  id: string;
  donante: string;
  categoria: string;
  descripcion: string;
  montoEstimado: number;
  fecha: string; // YYYY-MM-DD
}

export type UserRole = 'Admin' | 'Operador';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  role: UserRole;
  activo: boolean;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  GUESTS = 'guests',
  PAYMENTS = 'payments',
  DONATIONS = 'donations',
  INVENTORY = 'inventory',
  SETUP = 'setup',
  USERS = 'users',
  PROMPTS = 'prompts'
}

export interface PromptVersion {
  id: string;
  timestamp: string;
  descripcion: string;
  prompt: string;
  isActive: boolean;
}
