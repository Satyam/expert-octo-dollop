import { getFirstByTag } from './gets';

export const router = {
  push: (path: string, refresh?: boolean) => {
    history.pushState({ path }, '', path);
    matchPath(refresh);
  },
  replace: (path: string, refresh?: boolean) => {
    history.replaceState({ path }, '', path);
    matchPath(refresh);
  },
};

export const routes: Array<Route<any>> = [
  {
    path: '/',
    module: showAndHideHandler(getById('welcome')),
    heading: 'Welcome',
  },
  {
    path: '/login',
    module: loginHandler(getById('login')),
    heading: 'Login',
  },
  {
    path: '/vendedores',
    module: listVendedoresHandler(getById('listVendedores')),
    heading: 'Vendedores',
  },
  {
    path: '/vendedor/edit/:id',
    module: editVendedorHandler(getById('editVendedor')),
    heading: 'Modificar vendedor',
  },
  {
    path: '/vendedor/new',
    module: editVendedorHandler(getById('editVendedor')),
    heading: 'Agregar vendedor',
  },
  {
    path: '/vendedor/:id',
    module: showVendedorHandler(getById('showVendedor')),
    heading: 'Vendedor',
  },
  {
    path: '/ventas',
    module: listVentasHandler(getById('listVentas')),
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

let currentModule: ModuleReturn<any> | null = null;
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
