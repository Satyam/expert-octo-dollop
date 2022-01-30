import {
  getById,
  getFirstByTag,
  getAllByTag,
  getFirstByClass,
  getAllByClass,
  getTarget,
  getClosest,
  cloneTemplate,
} from './gets';
import apiService from './apiService';
type VentaYVendedor = Venta & { vendedor?: string };
const W = window;

// The navBar
const navBar = navBarHandler(getById('navbar'));

// routing
matchPath();

W.onpopstate = () => {
  matchPath();
};
