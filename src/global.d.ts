declare module '*.html';
type ID = string | number;
type Fila = Consignacion | Distribuidor | Salida | User | Venta;

type Consignacion = {
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

type Distribuidor = {
  id: ID;
  nombre: string;
  localidad?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
};

type Salida = {
  id: ID;
  fecha: Date;
  concepto?: string;
  importe?: number;
};

type User = {
  id: ID;
  nombre: string;
  email?: string;
  password?: string;
};

type Vendedor = {
  id: ID;
  nombre: string;
  email?: string;
};

type Venta = {
  id: ID;
  concepto?: string;
  fecha: Date;
  idVendedor?: ID;
  cantidad?: number;
  precioUnitario?: number;
  iva?: boolean;
};

type HandlerReturn<RParams, SearchOpts extends any = {}> = {
  render: (r: RParams, s?: SearchOpts) => void;
  close: () => void;
};
type Handler<RParams, SearchOpts extends any = {}> = (
  el?: HTMLElement
) => HandlerReturn<RParams, SearchOpts>;

type Route<RParams, SearchOpts extends any = {}> = {
  path: string;
  module: HandlerReturn<RParams, SearchOpts>;
  heading?: string;
  $_rx?: RegExp;
};

type VentaYVendedor = Venta & { vendedor?: string };
