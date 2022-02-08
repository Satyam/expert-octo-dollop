import { getById, getFirstByTag } from './gets';

import { checkLoggedIn, login } from './login';

import navbar from './navbar';
import { showAndHideHandler, error } from './popups';

import listVendedores from './listVendedores';
import editVendedor from './editVendedor';
import showVendedor from './showVendedor';
import listVentas from './listVentas';
import showVenta from './showVenta';
import editVenta from './editVenta';
navbar();

checkLoggedIn();
// routing

const edVenta = editVenta();
const edVendedor = editVendedor();

const routes: Array<Route<any>> = [
  {
    path: '/',
    module: showAndHideHandler(getById('welcome')),
    heading: 'Welcome',
  },
  {
    path: '/login',
    module: login(),
    heading: 'Login',
  },
  {
    path: '/vendedores',
    module: listVendedores(),
    heading: 'Vendedores',
  },
  {
    path: '/vendedor/edit/:id',
    module: edVendedor,
    heading: 'Modificar vendedor',
  },
  {
    path: '/vendedor/new',
    module: edVendedor,
    heading: 'Agregar vendedor',
  },
  {
    path: '/vendedor/:id',
    module: showVendedor(),
    heading: 'Vendedor',
  },
  {
    path: '/ventas',
    module: listVentas(),
    heading: 'Ventas',
  },
  {
    path: '/venta/edit/:id',
    module: edVenta,
    heading: 'Modificar venta',
  },
  {
    path: '/venta/new',
    module: edVenta,
    heading: 'Agregar venta',
  },
  {
    path: '/venta/:id',
    module: showVenta(),
    heading: 'Venta',
  },
  {
    path: '*',
    module: showAndHideHandler(getById('notFound')),
    heading: 'No existe',
  },
];

// create regular expressions for each route
routes.forEach((r) => {
  r.$_rx = new RegExp(
    `^${r.path
      .split('/')
      .map((p) => {
        if (p.startsWith(':')) return `(?<${p.substring(1)}>[^\\/]*)`;
        if (p === '*') return `(?<$>[^\?$]*)`;
        return p;
      })
      .join('\\/')}$`
  );
});

let currentModule: HandlerReturn<any> | null = null;
let currentPath = '';

function matchPath(refresh?: boolean) {
  error.close(); // Just in case there is any open
  const path = location.pathname;
  const fullPath = path + location.search;
  if (refresh || fullPath !== currentPath) {
    currentPath = fullPath;
    routes.some((r) => {
      if (r.$_rx && r.$_rx.test(path)) {
        currentModule?.close();
        currentModule = r.module;
        currentModule.render(
          path.match(r.$_rx)?.groups || {},
          Object.fromEntries(new URLSearchParams(location.search))
        );
        if (r.heading) getFirstByTag(document, 'h1').textContent = r.heading;
        return true;
      }
    });
  }
}

matchPath();

window.addEventListener('popstate', () => {
  matchPath();
});
window.addEventListener('router', ((ev: CustomEvent) => {
  matchPath(ev.detail.refresh);
}) as EventListener);
