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

type ModuleReturn<RParams extends unknown, SearchOpts extends any = {}> = {
  render: (r: RParams, s?: SearchOpts) => void;
  close: () => void;
};
type Module<RParams extends unknown, SearchOpts extends any = {}> = (
  el: HTMLElement
) => ModuleReturn<RParams, SearchOpts>;

type Route<RParams extends unknown, SearchOpts extends any = {}> = {
  path: string;
  module: ModuleReturn<RParams, SearchOpts>;
  heading?: string;
  $_rx?: RegExp;
};
