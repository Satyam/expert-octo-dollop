import { getById, getFirstByTag } from './gets';

import { checkLoggedIn, login } from './login';
import navbar from './navbar';
import { showAndHideHandler, error } from './popups';

import listVendedores from './listVendedores';
import editVendedor from './editVendedor';
import showVendedor from './showVendedor';
import listVentas from './listVentas';

navbar(getById('navbar'));

checkLoggedIn();
// routing

export const routes: Array<Route<any>> = [
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
    module: editVendedor(),
    heading: 'Modificar vendedor',
  },
  {
    path: '/vendedor/new',
    module: editVendedor(),
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

export function matchPath(refresh?: boolean) {
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

window.onpopstate = () => {
  matchPath();
};
window.addEventListener('router', ((ev: CustomEvent) => {
  matchPath(ev.detail.refresh);
}) as EventListener);
