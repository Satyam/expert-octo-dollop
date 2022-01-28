import type { ID, User, Vendedor, Venta } from './types';
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
import { setForm, readForm, watchFormChanges } from './form';
type VentaYVendedor = Venta & { vendedor?: string };
const W = window;

// Helpers

const setTitle = (title?: string) =>
  (document.title = title ? `La Corazón - ${title}` : 'La Corazón');

const show = ($: HTMLElement) => {
  $.style.display = 'block';
};
const hide = ($: HTMLElement) => {
  $.style.display = 'none';
};

const currency = 'EUR';
const locale = 'es-ES';

const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium',
});

const formatDate = (date: Date) => (date ? dateFormatter.format(date) : '');

const currFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
});

const formatCurrency = (value: number) =>
  value ? currFormatter.format(value) : '';

const router = {
  push: (path: string, refresh?: boolean) => {
    history.pushState({ path }, '', path);
    matchPath(refresh);
  },
  replace: (path: string, refresh?: boolean) => {
    history.replaceState({ path }, '', path);
    matchPath(refresh);
  },
};

const logout = () => {
  // To ensure everything is erased, do actually navigate and get everything refreshed
  location.replace('/');
};

const apiService = <
  IN extends Record<string, any> = Record<string, any>,
  OUT extends Record<string, any> = IN,
  OPT extends Record<string, any> = Record<string, any>
>(
  service: string,
  op: {
    op: string;
    id?: ID;
    data?: IN;
    options?: OPT;
  }
): Promise<OUT> => {
  loading.render();
  return fetch(`${W.origin}/api/${service}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(op),
  })
    .then((resp) => {
      if (resp && resp.ok) return resp.json();
      return Promise.reject(resp.statusText);
    })
    .then((resp) => {
      if (resp.error) return Promise.reject(resp.data);
      loading.close();
      return resp.data;
    })
    .catch((err) => {
      loading.close();
      error.render(err);
    });
};

const fillRow = <D extends Record<string, any>>(
  $row: HTMLTableRowElement,
  data: D,
  fn?: (fieldName: string, $el: HTMLElement, v: D) => boolean
) => {
  $row.dataset.id = String(data.id);
  getAllByClass($row, 'field').forEach(($el) => {
    const field = $el.dataset.field;
    if (field) {
      if (fn) if (fn(field, $el, data)) return;
      $el.textContent = data[field] || '';
    }
  });
};

const handleAccordion = ($a: HTMLElement) => {
  const toggleHandler = (ev: Event) => {
    const $d = getTarget<HTMLDetailsElement>(ev);
    const panelName = $d.dataset.panel;
    if (panelName) {
      if ($d.open) {
        openPanel(panelName);
      } else {
        closePanel(panelName);
      }
    }
  };

  const panels = getAllByTag<HTMLDetailsElement>($a, 'details').reduce(
    ($$ps, $p) => {
      $p.addEventListener('toggle', toggleHandler);
      const panelName = $p.dataset.panel;
      return panelName
        ? {
            ...$$ps,
            [panelName]: $p,
          }
        : $$ps;
    },
    {}
  );

  let currentOpen: string | undefined | null;

  const closePanel = (panelName: string) => {
    const $panel = panels[panelName];
    if (!$panel) return;
    if (panelName === currentOpen) {
      currentOpen = null;
      $panel.open = false;
      $panel.children[1].dispatchEvent(
        new CustomEvent('closePanel', {
          bubbles: true,
          detail: panelName,
        })
      );
    }
  };

  const openPanel = (panelName: string) => {
    const $panel = panels[panelName];
    if (!$panel) return;
    if (currentOpen) closePanel(currentOpen);
    currentOpen = panelName;
    $panel.open = true;
    $panel.children[1].dispatchEvent(
      new CustomEvent('openPanel', {
        bubbles: true,
        detail: panelName,
      })
    );
  };

  const togglePanel = (panelName: string) => {
    if (panelName === currentOpen) {
      closePanel(panelName);
    } else {
      openPanel(panelName);
    }
  };

  const closeAllPanels = () => closePanel(currentOpen || '');

  return {
    openPanel,
    closePanel,
    togglePanel,
    closeAllPanels,
    getOpenPanel: () => currentOpen,
  };
};

// Handlers of HTML components

// First some generic componets available for all routes

const navBarHandler = ($navbar: HTMLElement) => {
  const $toggleBtn = getFirstByClass($navbar, 'navbar-toggler');
  const $collapse = getFirstByClass($navbar, 'navbar-collapse');
  const $brand = getFirstByClass($navbar, 'navbar-brand');

  let $navItemActive: HTMLElement | null = null;

  const menuHandler: EventListener = (ev) => {
    ev.preventDefault();
    const $el = getTarget<HTMLAnchorElement>(ev);
    const path = $el.pathname;
    if (path === location.pathname) return;

    $navItemActive?.classList.remove('active');

    switch (path) {
      case '/logout':
        apiService('auth', {
          op: 'logout',
        }).then(logout, logout);
      default:
        const navItem = getClosest($el, '.nav-item');
        if (navItem) {
          $navItemActive = navItem;
          $navItemActive.classList.add('active');
        }
        $collapse.classList.remove('show');
        router.push(path);
        break;
    }
  };

  getAllByClass($navbar, 'navbar-nav').forEach(($menu) => {
    $menu.onclick = menuHandler;
  });

  $toggleBtn.onclick = (ev) => {
    ev.preventDefault();
    $collapse.classList.toggle('show');
  };

  $brand.onclick = (ev) => {
    ev.preventDefault();
    router.push('/');
  };
};

// Generic for components that just need showing and hiding
const showAndHideHandler: Module<void> = ($el) => {
  return {
    render: () => show($el),
    close: () => hide($el),
  };
};

const loading = showAndHideHandler(getById('loading'));

const errorHandler: Module<string> = ($error) => {
  return {
    render: (msg) => {
      getFirstByClass($error, 'msg').textContent = msg;
      show($error);
    },
    close: () => hide($error),
  };
};

const error = errorHandler(getById('error'));

const confirmarHandler = ($confirm: HTMLElement) => {
  const close = () => {
    $confirm.classList.remove('show');
    $confirm.style.display = 'none';
  };
  const ask = (msg: string, header?: string, danger?: boolean) =>
    new Promise((resolve) => {
      getFirstByClass($confirm, 'modal-body').textContent = msg;
      getFirstByClass($confirm, 'modal-title').textContent =
        header ?? '¿Está seguro?';
      const $headerClass = getFirstByClass($confirm, 'modal-header').classList;
      $headerClass.toggle('bg-danger', danger);
      $headerClass.toggle('text-white', danger);
      const $yesClass = getFirstByClass($confirm, 'yes').classList;
      $yesClass.toggle('btn-danger', danger);
      $yesClass.toggle('btn-primary', !danger);

      $confirm.style.display = 'block';
      $confirm.classList.add('show');
      $confirm.onclick = (ev) => {
        ev.preventDefault();
        const $t = getClosest(getTarget(ev), '.action');
        switch ($t?.dataset.action) {
          case 'yes':
            close();
            resolve(true);
            break;
          case 'no':
            close();
            resolve(false);
            break;
        }
      };
    });
  return {
    ask,
    close,
  };
};
const confirmar = confirmarHandler(getById('confirm'));

const setUser = (user: Partial<User>) => {
  if (user && user.nombre) {
    const $container = getById('container');
    $container.classList.replace('not-logged-in', 'is-logged-in');
    const $navbar = getById('navbar');
    getFirstByClass($navbar, 'user-name').textContent = user.nombre;
  }
};

const isLoggedIn = () =>
  getById('container').classList.contains('is-logged-in');

const checkLoggedIn = () =>
  apiService<{}, User>('auth', {
    op: 'isLoggedIn',
  }).then((user) => {
    if (user) {
      setUser(user);
      setTimeout(checkLoggedIn, 1_800_000);
    } else {
      if (isLoggedIn()) logout();
    }
  });

checkLoggedIn();

const loginHandler: Module<void> = ($login) => {
  const $form = getFirstByTag<HTMLFormElement>($login, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($login, 'button');

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const data = readForm<Partial<User>>($form);
    if (data) {
      apiService<Partial<User>>('auth', {
        op: 'login',
        data,
      }).then((user) => {
        setUser(user);
        setTimeout(checkLoggedIn, 1_800_000);
        router.replace('/');
      });
    }
  };

  watchFormChanges($form, $submit);

  const render = () => {
    $form.classList.remove('was-validated');
    show($login);
  };

  return {
    render,
    close: () => hide($login),
  };
};

// Now app-related handlers

const listVendedoresHandler: Module<void> = ($listVendedores) => {
  const $tableVendedores = getById('tableVendedores');
  const $tbodyVendedores = getFirstByTag<HTMLTableSectionElement>(
    $tableVendedores,
    'tbody'
  );
  const $tplVendedores = getById('tplVendedores') as HTMLTemplateElement;

  $tableVendedores.onclick = (ev) => {
    ev.preventDefault();
    const $t = getTarget(ev);
    const action = getClosest($t, '.action')?.dataset.action;
    if (action) {
      const id = getClosest($t, 'tr').dataset.id;
      switch (action) {
        case 'add':
          router.push('/vendedor/new');
          break;
        case 'show':
          router.push(`/vendedor/${id}`);
          break;
        case 'edit':
          router.push(`/vendedor/edit/${id}`);
          break;
        case 'delete':
          confirmar
            .ask('¿Quiere borrar este vendedor?', undefined, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('vendedores', {
                  op: 'remove',
                  id,
                })
              );
            })
            .then(() => {
              router.replace(`/vendedores`, true);
            });
          break;
      }
    }
  };

  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    apiService<{}, Vendedor[]>('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      const $$tr = getAllByTag<HTMLTableRowElement>($tbodyVendedores, 'tr');
      $$tr.forEach(($row, index) => {
        if (index >= vendedores.length) {
          $row.classList.add('hidden');
        } else {
          $row.classList.remove('hidden');
          fillRow($row, vendedores[index]);
        }
      });

      vendedores.slice($$tr.length).forEach((v) => {
        const $row = cloneTemplate<HTMLTableRowElement>($tplVendedores);
        fillRow($row, v);
        $tbodyVendedores.append($row);
      });
    });
  };
  return {
    render,
    close: () => hide($listVendedores),
  };
};

const showVendedorHandler: Module<{ id: ID }> = ($showVendedor) => {
  // `listVentas` is not a template but a plain node, don't use `cloneTemplate` on it.
  const $panelVentas = <HTMLElement>getById('listVentas').cloneNode(true);
  const $accordion = getFirstByClass($showVendedor, 'accordion');
  const { closeAllPanels } = handleAccordion($accordion);

  const render = ({ id }) => {
    $accordion.addEventListener('openPanel', ((ev: CustomEvent) => {
      const $panelBody = getTarget(ev);
      switch (ev.detail) {
        case 'ventas':
          if ($panelBody.children.length === 0) $panelBody.append($panelVentas);
          listVentasHandler($panelVentas).render({ idVendedor: id });
          break;
        case 'consigna':
          break;
      }
    }) as EventListener);

    apiService<{}, Vendedor>('vendedores', {
      op: 'get',
      id,
    }).then((v) => {
      if (v) {
        setForm(getFirstByTag($showVendedor, 'form'), v);
        show($showVendedor);
      }
    });
  };

  return {
    render,
    close: () => {
      closeAllPanels();
      hide($showVendedor);
    },
  };
};

const editVendedorHandler: Module<{ id: ID }> = ($editVendedor) => {
  const $form = getFirstByTag<HTMLFormElement>($editVendedor, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($editVendedor, 'button');

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const data = readForm<Partial<Vendedor>>($form);
    if (data) {
      const isNew = !data.id;

      apiService<Partial<Vendedor>>('vendedores', {
        op: isNew ? 'create' : 'update',
        id: data.id,
        data,
      }).then((data) => {
        if (data) {
          if (isNew) {
            router.replace(`/vendedor/edit/${data.id}`);
          } else {
            setForm($form, data);
          }
        }
      });
    }
  };
  watchFormChanges($form, $submit);

  const render = ({ id }) => {
    $form.classList.remove('was-validated');
    if (id) {
      apiService<{}, Partial<Vendedor>>('vendedores', {
        op: 'get',
        id,
      }).then((v) => {
        getFirstByClass($form, 'btn').textContent = 'Modificar';
        setForm($form, v);
        show($editVendedor);
      });
    } else {
      getFirstByClass($form, 'btn').textContent = 'Agregar';
      $form.reset();
      show($editVendedor);
    }
  };

  return {
    render,
    close: () => hide($editVendedor),
  };
};

const listVentasHandler: Module<{ idVendedor?: ID }> = ($listVentas) => {
  const $tableVentas = getById('tableVentas');
  const $tbodyVentas = getFirstByTag<HTMLTableSectionElement>(
    $tableVentas,
    'tbody'
  );
  const $tplVentas = getById('tplVentas') as HTMLTemplateElement;

  $tableVentas.onclick = (ev) => {
    ev.preventDefault();
    const $t = getTarget(ev);
    const action = getClosest($t, '.action')?.dataset.action;
    if (action) {
      const id = getClosest($t, 'tr').dataset.id;
      switch (action) {
        case 'add':
          router.push('/venta/new');
          break;
        case 'show':
          router.push(`/venta/${id}`);
          break;
        case 'edit':
          router.push(`/venta/edit/${id}`);
          break;
        case 'delete':
          confirmar
            .ask('¿Quiere borrar esta venta?', undefined, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('ventas', {
                  op: 'remove',
                  id,
                })
              );
            })
            .then(() => {
              router.replace(`/ventas`, true);
            });
          break;
        case 'showVendedor':
          const idVendedor = getClosest($t, '.action')?.dataset.idVendedor;
          router.push(`/vendedor/${idVendedor}`);
          break;
      }
    }
  };

  const fr = ($row: HTMLTableRowElement, v: Venta) =>
    fillRow<
      Omit<Venta, 'precioUnitario' | 'fecha'> & {
        precioTotal: string;
        precioUnitario: string;
        fecha: string;
      }
    >(
      $row,
      {
        ...v,
        precioTotal: formatCurrency(
          (v.cantidad || 0) * (v.precioUnitario || 0)
        ),
        precioUnitario: formatCurrency(v.precioUnitario || 0),
        fecha: formatDate(new Date(v.fecha)),
      },
      (name, $el, venta) => {
        switch (name) {
          case 'idVendedor':
            $el.dataset.idVendedor = String(venta.idVendedor);
            return true;
          case 'iva':
            $el.classList.add(venta.iva ? 'bi-check-square' : 'bi-square');
            return true;
          default:
            return false;
        }
      }
    );

  const render = (options: { idVendedor?: ID } = {}) => {
    setTitle('Ventas');
    show($listVentas);

    apiService<{}, VentaYVendedor[]>('ventas', {
      op: 'list',
      options,
    }).then((ventas) => {
      const $$tr = getAllByTag<HTMLTableRowElement>($tbodyVentas, 'tr');
      $$tr.forEach(($row, index) => {
        if (index >= ventas.length) {
          $row.classList.add('hidden');
        } else {
          $row.classList.remove('hidden');
          fr($row, ventas[index]);
        }
      });

      ventas.slice($$tr.length).forEach((v) => {
        const $row = cloneTemplate<HTMLTableRowElement>($tplVentas);
        fr($row, v);
        $tbodyVentas.append($row);
      });
      getAllByClass($tableVentas, 'idVendedor').forEach(($el) => {
        $el.classList.toggle('hidden', !!options.idVendedor);
      });
    });
  };
  return {
    render,
    close: () => hide($listVentas),
  };
};

// Routing

// Routing table

type ModuleReturn<RParams extends unknown> = {
  render: (r: RParams) => void;
  close: () => void;
};
type Module<RParams extends unknown> = (
  el: HTMLElement
) => ModuleReturn<RParams>;

type Route<RParams extends unknown> = {
  path: string;
  module: ModuleReturn<RParams>;
  heading?: string;
  $_rx?: RegExp;
};

const routes: Array<Route<any>> = [
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
        currentModule.render({
          ...(path.match(r.$_rx)?.groups || {}),
          ...Object.fromEntries(new URLSearchParams(location.search)),
        });
        if (r.heading) getFirstByTag(document, 'h1').textContent = r.heading;
        return true;
      }
    });
  }
}

// Here we start activating the application.
// So far, nothing is visible

// The navBar
const navBar = navBarHandler(getById('navbar'));

// routing
matchPath();

W.onpopstate = () => {
  matchPath();
};
