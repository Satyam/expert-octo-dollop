export type ID = string | number;
export type Fila = Consignacion | Distribuidor | Salida | User | Venta;

export type Consignacion = {
  id: ID;
  fecha: Date;
  idDistribuidor?: ID;
  idVendedor?: ID;
  entregados?: number;
  porcentaje?: number;
  vendidos?: number;
  devueltos?: number;
  cobrado?: number;
  iva?: boolean;
  comentarios?: string;
};

export type Distribuidor = {
  id: ID;
  nombre: string;
  localidad?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
};

export type Salida = {
  id: ID;
  fecha: Date;
  concepto?: string;
  importe?: number;
};

export type User = {
  id: ID;
  nombre: string;
  email?: string;
  password?: string;
};

export type Vendedor = {
  id: ID;
  nombre: string;
  email?: string;
};

export type Venta = {
  id: ID;
  concepto?: string;
  fecha: Date;
  idVendedor?: ID;
  cantidad?: number;
  precioUnitario?: number;
  iva?: boolean;
};
