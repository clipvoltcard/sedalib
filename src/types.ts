export type UserRole = 'administrador' | 'técnico';

export interface User {
  id: string;
  username: string;
  nombre: string;
  rol: UserRole;
  estado: 'activo' | 'inactivo';
  password?: string; // only used on backend or creation
}

export interface Material {
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  stockActual: number;
  stockMinimo: number;
  estadoOperativo: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio';
}

export interface Entrada {
  id: string;
  fecha: string;
  materialCodigo: string;
  materialNombre: string;
  cantidad: number;
  proveedor: string;
  responsable: string;
  observaciones: string;
  timestamp: string;
}

export interface Salida {
  id: string;
  fecha: string;
  materialCodigo: string;
  materialNombre: string;
  cantidad: number;
  tecnicoSolicitante: string;
  motivo: string;
  timestamp: string;
}

export interface Movimiento {
  id: string;
  usuario: string;
  fechaHora: string;
  accion: string;
  materialAfectado: string;
}

export interface DashboardStats {
  totalMateriales: number;
  stockDisponible: number;
  materialesBajoStock: number;
  entradasHoy: number;
  salidasHoy: number;
}
