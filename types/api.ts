// Tipos basados en la documentación de la API

export interface Buffet {
  _id?: string;
  nombre: string;
  lugar: string;
  descripcion: string;
  user_id: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Evento {
  _id?: string;
  nombre: string;
  fecha: Date;
  buffet_id: string;
  user_id: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Datos enriquecidos
  buffet?: Buffet;
  imagen?: string;
  descripcion?: string
    redes_artista?: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    youtube?: string;
  };
}

export interface Producto {
  disponible: boolean;
  _id?: string;
  buffet_id: string;
  user_id: string;
  nombre: string;
  valor: number;
  descripcion: string;
  imagen?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Datos enriquecidos
  buffet?: Buffet;
}

export interface Promo {
  _id?: string;
  buffet_id: string;
  user_id: string;
  nombre: string;
  productos: string[]; // Array de product_ids
  valor: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Datos enriquecidos
  buffet?: Buffet;
  productosDetalle?: Producto[];
}

export interface ItemProducto {
  tipo: 'producto' | 'promo';
  id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface ProductoExpandido {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  origen: 'directo' | 'promo';
  promo_nombre?: string;
}

export interface Orden {
  _id?: string;
  buffet_id: string;
  evento_id: string;
  user_id: string;
  cliente_nombre: string;
  productos: ItemProducto[];
  productosExpandidos: ProductoExpandido[];
  total: number;
  forma_pago: 'efectivo' | 'transferencia';
  nota?: string;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Datos enriquecidos
  buffet?: Buffet;
  evento?: Evento;
}

// Tipos para crear recursos
export interface CreateBuffetData {
  nombre: string;
  lugar: string;
  descripcion: string;
}

export interface CreateEventoData {
  nombre: string;
  fecha: string; // ISO string
  buffet_id: string;
  imagen: string;
  descripcion?: string;
  redes_artista?: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    youtube?: string;
  };
}

export interface UpdateEventoData {
  nombre: string;
  fecha: string; // ISO string
  buffet_id: string;
  imagen: string;
  descripcion?: string;
  redes_artista?: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    youtube?: string;
  };
}

export interface CreateProductoData {
  buffet_id: string;
  nombre: string;
  valor: number;
  descripcion: string;
  imagen: string;
  disponible?: boolean | null;
}

export interface UpdateProductoData {
  buffet_id: string;
  nombre: string;
  valor: number;
  descripcion: string;
  imagen: string;
  disponible?: boolean | null;
}

export interface CreatePromoData {
  buffet_id: string;
  nombre: string;
  productos: string[];
  valor: number;
}

export interface UpdatePromoData {
  buffet_id: string;
  nombre: string;
  productos: string[];
  valor: number;
}

// Tipos de errores para formularios
export interface ProductoFormErrors {
  buffet_id?: string;
  nombre?: string;
  valor?: string;
  descripcion?: string;
  imagen?: string;
  disponible?: string;
}

export interface PromoFormErrors {
  buffet_id?: string;
  nombre?: string;
  productos?: string;
  valor?: string;
}

export interface CreateOrdenData {
  buffet_id: string;
  evento_id: string;
  productos: ItemProducto[];
  total: number;
  forma_pago: 'efectivo' | 'transferencia';
  nota?: string;
  estado: 'pendiente' | 'entregado' | 'cancelado';
}

// Tipos para filtros de búsqueda
export interface BuffetFilters {
  nombre?: string;
  lugar?: string;
  user_id?: string;
  limite?: number;
  pagina?: number;
}

export interface EventoFilters {
  buffet_id?: string;
  user_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  limite?: number;
  pagina?: number;
}

export interface ProductoFilters {
  buffet_id?: string;
  user_id?: string;
  nombre?: string;
  limite?: number;
  pagina?: number;
}

export interface PromoFilters {
  buffet_id?: string;
  user_id?: string;
  nombre?: string;
  limite?: number;
  pagina?: number;
}

export interface OrdenFilters {
  buffet_id?: string;
  evento_id?: string;
  user_id?: string;
  estado?: 'pendiente' | 'entregado' | 'cancelado';
  forma_pago?: 'efectivo' | 'transferencia';
  nota?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  total_min?: number;
  total_max?: number;
  limite?: number;
  pagina?: number;
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Respuestas específicas de la API
export interface BuffetsResponse extends PaginatedResponse<Buffet> {
  buffets: Buffet[];
}

export interface EventosResponse extends PaginatedResponse<Evento> {
  eventos: Evento[];
}

export interface ProductosResponse extends PaginatedResponse<Producto> {
  productos: Producto[];
}

export interface PromosResponse extends PaginatedResponse<Promo> {
  promos: Promo[];
}

export interface OrdenesResponse extends PaginatedResponse<Orden> {
  ordenes: Orden[];
}

// Tipos para errores de la API
export interface ApiError {
  error: string;
  details?: any;
  status: number;
}

// Tipos de respuestas de creación
export interface CreateResponse<T> {
  message: string;
  [key: string]: T | string; // Para datos dinámicos como { buffet: Buffet }
}