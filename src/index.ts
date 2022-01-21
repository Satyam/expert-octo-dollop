import type { ID, User, Vendedor, Venta } from './types';

const W = window;

// Helpers
const getById = (id: string): HTMLElement => document.getElementById(id);
const getFirstByClass = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): T => $.getElementsByClassName(name)[0] as T;

const getAllByClass = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): Array<T> => Array.from($.getElementsByClassName(name)) as T[];

const getFirstByTag = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): T => $.getElementsByTagName(name)[0] as T;

const getAllByTag = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): Array<T> => Array.from($.getElementsByTagName(name)) as T[];

const getClosest = <T extends HTMLElement>($: Element, selector: string): T =>
  $.closest(selector) as T;

const getTarget = <T extends HTMLElement>(ev: Event): T => ev.target as T;

const cloneTemplate = <T extends HTMLElement>($tpl: HTMLTemplateElement) =>
  ($tpl.content.cloneNode(true) as HTMLElement).firstElementChild as T;

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
      return Promise.reject();
    });
};

const handleAccordion = ($a: HTMLElement) => {
  const toggleHandler = (ev: Event) => {
    const $d = getTarget<HTMLDetailsElement>(ev);
    const panelName = $d.dataset.panel;
    if ($d.open) {
      openPanel(panelName);
    } else {
      closePanel(panelName);
    }
  };

  const panels = Array.from(getAllByTag($a, 'details')).reduce(($$ps, $p) => {
    $p.addEventListener('toggle', toggleHandler);
    return {
      ...$$ps,
      [$p.dataset.panel]: $p,
    };
  }, {});

  let currentOpen: string | undefined | null;

  const closePanel = (panelName) => {
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

  const openPanel = (panelName) => {
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

  const togglePanel = (panelName) => {
    if (panelName === currentOpen) {
      closePanel(panelName);
    } else {
      openPanel(panelName);
    }
  };

  const closeAllPanels = () => closePanel(currentOpen);

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

  let $navItemActive = null;

  const menuHandler: EventListener = (ev) => {
    ev.preventDefault();
    const path = getTarget<HTMLAnchorElement>(ev).pathname;
    if (path === location.pathname) return;

    $navItemActive?.classList.remove('active');

    switch (path) {
      case '/logout':
        apiService('auth', {
          op: 'logout',
        }).then(logout, logout);
      default:
        const navItem = getTarget(ev).closest('.nav-item');
        $navItemActive = navItem;
        $navItemActive.classList.add('active');

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
const showAndHideHandler: Module = ($el: HTMLElement) => {
  return {
    render: () => show($el),
    close: () => hide($el),
  };
};

const loading = showAndHideHandler(getById('loading'));

const errorHandler = ($error: HTMLElement) => {
  return {
    render: (msg: string) => {
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
  const ask = (msg: string, header: string, danger?: boolean) =>
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

const setUser = (user) => {
  if (user) {
    const $container = getById('container');
    $container.classList.replace('not-logged-in', 'is-logged-in');
    const $navbar = getById('navbar');
    getFirstByClass($navbar, 'user-name').textContent = user.nombre;
  }
};
const checkLoggedIn = () =>
  apiService<{}, User>('auth', {
    op: 'isLoggedIn',
  })
    .then((user) => {
      setUser(user);
    })
    .then(() => {
      setTimeout(checkLoggedIn, 1_800_000);
    })
    .catch((err) => {
      console.error('checkLoggedIn', err);
    });

checkLoggedIn();

const loginHandler: Module = ($login) => {
  const $form = getFirstByTag<HTMLFormElement>($login, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($login, 'button');

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if ($form.checkValidity()) {
      $form.classList.add('was-validated');
      const data = getAllByTag<HTMLInputElement>($form, 'input').reduce(
        (prev, el) => (el.name ? { ...prev, [el.name]: el.value } : prev),
        {}
      );

      apiService<Partial<User>>('auth', {
        op: 'login',
        data,
      })
        .then(setUser)
        .then(() => {
          router.replace('/');
        })
        .catch(() => null);
    }
  };

  getAllByTag<HTMLInputElement>($form, 'input').forEach(($input) => {
    $input.onkeydown = () => {
      $form.classList.remove('was-validated');
      $submit.disabled = true;
      getAllByTag<HTMLInputElement>($form, 'input').some(($i) => {
        if ($i.value !== $i.dataset.value) {
          $submit.disabled = false;
          return true;
        }
      });
    };
  });

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

const listVendedoresHandler: Module = ($listVendedores) => {
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
            .ask('¿Quiere borrar este vendedor?', null, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('vendedores', {
                  op: 'remove',
                  id,
                }).catch(() => null)
              );
            })
            .then((result) => {
              if (result !== false) {
                router.replace(`/vendedores`, true);
              }
            });
          break;
      }
    }
  };

  const fillRow = ($row, v) => {
    $row.dataset.id = v.id;
    getFirstByClass($row, 'nombre').textContent = v.nombre;
    getFirstByClass($row, 'email').textContent = v.email;
  };
  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    apiService<{}, Vendedor[]>('vendedores', {
      op: 'list',
    })
      .then((vendedores) => {
        const $$tr = getAllByTag($tbodyVendedores, 'tr');
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
      })
      .catch(() => null);
  };
  return {
    render,
    close: () => hide($listVendedores),
  };
};

const showVendedorHandler: Module<{ id: ID }> = ($showVendedor) => {
  const $panelVentas = <HTMLElement>getById('listVentas').cloneNode(true);
  const $accordion = getFirstByClass($showVendedor, 'accordion');
  const { closeAllPanels } = handleAccordion($accordion);

  const render = ({ id }) => {
    $accordion.addEventListener('openPanel', ((ev: CustomEvent) => {
      const $panelBody = getTarget(ev);
      const panelName = ev.detail;
      // const { detail: panelName, target: $panelBody } = ev;
      switch (panelName) {
        case 'ventas':
          if ($panelBody.children.length === 0) $panelBody.append($panelVentas);
          listVentasHandler($panelVentas).render({ idVendedor: id });
          break;
        case 'consigna':
          break;
      }
    }) as EventListener);
    $accordion.addEventListener('close', console.log);
    apiService<{}, Vendedor>('vendedores', {
      op: 'get',
      id,
    })
      .then((v) => {
        if (v) {
          getFirstByClass<HTMLInputElement>($showVendedor, 'nombre').value =
            v.nombre;
          getFirstByClass<HTMLInputElement>($showVendedor, 'email').value =
            v.email;
          show($showVendedor);
        }
      })
      .catch(() => null);
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

  const setFields = (v) => {
    getAllByTag<HTMLInputElement>($form, 'input').forEach(($input) => {
      $input.dataset.value = $input.value = v ? v[$input.name] : '';
    });
  };

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if ($form.checkValidity()) {
      $form.classList.add('was-validated');
      const data = <Partial<Vendedor>>(
        getAllByTag<HTMLInputElement>($form, 'input').reduce(
          (prev, el) => (el.name ? { ...prev, [el.name]: el.value } : prev),
          {}
        )
      );

      const isNew = !data.id;

      apiService<Partial<Vendedor>>('vendedores', {
        op: isNew ? 'create' : 'update',
        id: data.id,
        data,
      })
        .then((data) => {
          if (data) {
            if (isNew) {
              router.replace(`/vendedor/edit/${data.id}`);
            } else {
              setFields(data);
            }
          }
        })
        .catch(() => null);
    }
  };

  getAllByTag<HTMLInputElement>($form, 'input').forEach(($input) => {
    $input.onkeydown = (ev) => {
      $form.classList.remove('was-validated');
      $submit.disabled = true;
      getAllByTag<HTMLInputElement>($form, 'input').some(($i) => {
        if ($i.value !== $i.dataset.value) {
          $submit.disabled = false;
          return true;
        }
      });
    };
  });

  const render = ({ id }) => {
    $form.classList.remove('was-validated');
    if (id) {
      apiService<{}, Partial<Vendedor>>('vendedores', {
        op: 'get',
        id,
      })
        .then((v) => {
          getFirstByClass($form, 'btn').textContent = 'Modificar';
          setFields(v);
          show($editVendedor);
        })
        .catch(() => null);
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
            .ask('¿Quiere borrar esta venta?', null, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('ventas', {
                  op: 'remove',
                  id,
                }).catch(() => null)
              );
            })
            .then((result) => {
              if (result !== false) {
                router.replace(`/ventas`, true);
              }
            });
          break;
        case 'showVendedor':
          const idVendedor = getClosest($t, '.action')?.dataset.idVendedor;
          router.push(`/vendedor/${idVendedor}`);
          break;
      }
    }
  };

  const fillRow = ($row, v) => {
    $row.dataset.id = v.id;
    getFirstByClass<HTMLTableCellElement>($row, 'fecha').textContent =
      formatDate(new Date(v.fecha));
    getFirstByClass<HTMLTableCellElement>($row, 'concepto').textContent =
      v.concepto;
    getFirstByClass<HTMLTableCellElement>($row, 'vendedor').textContent =
      v.vendedor;
    getFirstByClass<HTMLTableCellElement>(
      $row,
      'idVendedor'
    ).dataset.idVendedor = v.idVendedor;
    getFirstByClass<HTMLTableCellElement>($row, 'cantidad').textContent =
      v.cantidad;
    getFirstByClass<HTMLTableCellElement>($row, 'precioUnitario').textContent =
      formatCurrency(v.precioUnitario);
    getFirstByClass<HTMLTableCellElement>($row, 'iva').classList.add(
      v.iva ? 'bi-check-square' : 'bi-square'
    );
    getFirstByClass<HTMLTableCellElement>($row, 'precioTotal').textContent =
      formatCurrency(v.cantidad * v.precioUnitario);
  };
  const render = (options) => {
    setTitle('Ventas');
    show($listVentas);

    apiService<{}, Venta[]>('ventas', {
      op: 'list',
      options,
    })
      .then((ventas) => {
        const $$tr = getAllByTag<HTMLTableRowElement>($tbodyVentas, 'tr');
        $$tr.forEach(($row, index) => {
          if (index >= ventas.length) {
            $row.classList.add('hidden');
          } else {
            $row.classList.remove('hidden');
            fillRow($row, ventas[index]);
          }
        });

        ventas.slice($$tr.length).forEach((v) => {
          const $row = cloneTemplate<HTMLTableRowElement>($tplVentas);
          fillRow($row, v);
          $tbodyVentas.append($row);
        });
        getAllByClass($tableVentas, 'idVendedor').forEach(($el) => {
          $el.classList.toggle('hidden', !!options.idVendedor);
        });
      })
      .catch(() => null);
  };
  return {
    render,
    close: () => hide($listVentas),
  };
};

// Routing

// Routing table

type ModuleReturn<RParams extends Record<string, any> | void = void> = {
  render: (r: RParams) => void;
  close: () => void;
};
type Module<RParams extends Record<string, any> | void = void> = (
  el: HTMLElement
) => ModuleReturn<RParams>;

type Route<RParams extends Record<string, any> | void = void> = {
  path: string;
  module: ModuleReturn<RParams>;
  heading?: string;
  $_rx?: RegExp;
};

const routes: Array<Route | Route<{ id: ID }> | Route<{ idVendedor: ID }>> = [
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

let currentModule = null;
let currentPath = '';

function matchPath(refresh?: boolean) {
  error.close(); // Just in case there is any open
  const path = location.pathname;
  const fullPath = path + location.search;
  if (refresh || fullPath !== currentPath) {
    currentPath = fullPath;
    routes.some((r) => {
      if (r.$_rx.test(path)) {
        currentModule?.close();
        currentModule = r.module;
        currentModule.render({
          ...(path.match(r.$_rx)?.groups || {}),
          ...Object.fromEntries(new URLSearchParams(location.search)),
        });
        getFirstByTag(document, 'h1').textContent = r.heading;
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
