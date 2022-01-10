// Constants
const D = document;

// Helpers

const setTitle = (title) =>
  (document.title = title ? `La Corazón - ${title}` : 'La Corazón');

const _show = ($) => {
  $.style.display = 'block';
};
const _hide = ($) => {
  $.style.display = 'none';
};

const currency = 'EUR';
const locale = 'es-ES';

const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium',
});

const formatDate = (date) => (date ? dateFormatter.format(date) : '');

const currFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
});

const formatCurrency = (value) => (value ? currFormatter.format(value) : '');

const router = {
  push: (path, refresh) => {
    history.pushState({ path }, '', path);
    matchPath(refresh);
  },
  replace: (path, refresh) => {
    history.replaceState({ path }, '', path);
    matchPath(refresh);
  },
};

const post = (service, op) =>
  fetch(`${window.origin}/api/${service}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(op),
  });

const apiService = (service, op) => {
  loading.render();
  return post('verify')
    .then((resp) => {
      if (resp.ok) return post(service, op);
      return Promise.reject('unauthorized');
    })
    .then((resp) => {
      if (resp && resp.ok) return resp.json();
      return Promise.reject(resp.statusText);
    })
    .then((resp) => {
      if (resp.error) return Promise.reject(resp.data);
      loading.hide();
      return resp.data;
    })
    .catch((err) => {
      loading.hide();
      error.render(err);
    });
};

const handleAccordion = ($a) => {
  const panels = Array.from($a.getElementsByClassName('card-header')).reduce(
    (ps, $ch) => ({
      ...ps,
      [$ch.dataset.panel]: $ch,
    }),
    {}
  );

  let currentOpen;

  const closePanel = (panelName) => {
    const $panel = panels[panelName];
    if (!$panel) return;
    if (panelName === currentOpen) {
      currentOpen = null;
      $panel.classList.remove('is-open');
      $panel.nextElementSibling.classList.remove('show');
      $panel.nextElementSibling.firstElementChild.dispatchEvent(
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
    $panel.classList.add('is-open');
    $panel.nextElementSibling.classList.add('show');
    $panel.nextElementSibling.firstElementChild.dispatchEvent(
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

  $a.onclick = (ev) => {
    ev.preventDefault();
    const $panel = ev.target.closest('.card-header');
    if (!$panel) return;
    const panelName = $panel.dataset.panel;
    togglePanel(panelName);
  };

  return {
    openPanel,
    closePanel,
    togglePanel,
    closeAllPanels,
    getOpenPanel: () => currentOpen,
  };
};

// Handlers of HTML components

// First some generic componets always available
const navBarHandler = ($navbarMenu) => {
  let $navItemActive = null;

  const onNavbarMenu = (ev) => {
    ev.preventDefault();
    const navItem = ev.target.closest('.nav-item');
    const { path } = navItem.dataset;
    if (path === location.pathname) return;

    $navItemActive?.classList.remove('active');
    $navItemActive = navItem;
    $navItemActive.classList.add('active');

    router.push(path);
  };

  $navbarMenu.onclick = onNavbarMenu;
};

// Generic for components that just need showing and hiding
const showAndHideHandler = ($el) => {
  return {
    render: () => _show($el),
    hide: () => _hide($el),
  };
};

const loading = showAndHideHandler(D.getElementById('loading'));

const errorHandler = ($error) => {
  return {
    render: (msg) => {
      $error.getElementsByClassName('msg')[0].textContent = msg;
      _show($error);
    },
    hide: () => _hide($error),
  };
};

const error = errorHandler(D.getElementById('error'));

const confirmarHandler = ($confirm) => {
  const hide = () => {
    $confirm.classList.remove('show');
    $confirm.style.display = 'none';
  };
  const ask = (msg, header, danger) =>
    new Promise((resolve) => {
      $confirm.getElementsByClassName('modal-body')[0].textContent = msg;
      $confirm.getElementsByClassName('modal-title')[0].textContent =
        header ?? '¿Está seguro?';
      const $headerClass =
        $confirm.getElementsByClassName('modal-header')[0].classList;
      $headerClass.toggle('bg-danger', danger);
      $headerClass.toggle('text-white', danger);
      $yesClass = $confirm.getElementsByClassName('yes')[0].classList;
      $yesClass.toggle('btn-danger', danger);
      $yesClass.toggle('btn-primary', !danger);

      $confirm.style.display = 'block';
      $confirm.classList.add('show');
      $confirm.onclick = (ev) => {
        ev.preventDefault();
        const $t = ev.target.closest('.action');
        switch ($t?.dataset.action) {
          case 'yes':
            hide();
            resolve(true);
            break;
          case 'no':
            hide();
            resolve(false);
            break;
        }
      };
    });
  return {
    ask,
    hide,
  };
};
const confirmar = confirmarHandler(D.getElementById('confirm'));

// Now app-related handlers
const listVendedoresHandler = ($listVendedores) => {
  const $tableVendedores = D.getElementById('tableVendedores');
  const $tbodyVendedores = $tableVendedores.getElementsByTagName('tbody')[0];
  const $tplVendedores = D.getElementById('tplVendedores');

  $tableVendedores.onclick = (ev) => {
    ev.preventDefault();
    const $t = ev.target;
    const action = $t.closest('.action')?.dataset.action;
    if (action) {
      const id = $t.closest('tr').dataset.id;
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
                })
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
    $row.getElementsByClassName('nombre')[0].textContent = v.nombre;
    $row.getElementsByClassName('email')[0].textContent = v.email;
  };
  const render = () => {
    setTitle('Vendedores');
    _show($listVendedores);
    apiService('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      const $$tr = Array.from($tbodyVendedores.getElementsByTagName('tr'));
      $$tr.forEach(($row, index) => {
        if (index >= vendedores.length) {
          _hide($row);
        } else {
          _show($row);
          fillRow($row, vendedores[index]);
        }
      });

      vendedores.slice($$tr.length).forEach((v) => {
        const $row = $tplVendedores.content.cloneNode(true).firstElementChild;
        fillRow($row, v);
        $tbodyVendedores.append($row);
      });
    });
  };
  return {
    render,
    hide: () => _hide($listVendedores),
  };
};

const showVendedorHandler = ($showVendedor) => {
  $panelVentas = D.getElementById('listVentas').cloneNode(true);
  $accordion = $showVendedor.getElementsByClassName('accordion')[0];
  const { closeAllPanels } = handleAccordion($accordion);

  const render = ({ id }) => {
    $accordion.addEventListener('openPanel', (ev) => {
      const { detail: panelName, target: $panelBody } = ev;
      switch (panelName) {
        case 'ventas':
          if ($panelBody.children.length === 0) $panelBody.append($panelVentas);
          listVentasHandler($panelVentas).render({ idVendedor: id });
          break;
        case 'consigna':
          break;
      }
    });
    $accordion.addEventListener('close', console.log);
    apiService('vendedores', {
      op: 'get',
      id,
    }).then((v) => {
      if (v) {
        $showVendedor.getElementsByClassName('nombre')[0].value = v.nombre;
        $showVendedor.getElementsByClassName('email')[0].value = v.email;
        _show($showVendedor);
      }
    });
  };

  return {
    render,
    hide: () => {
      closeAllPanels();
      _hide($showVendedor);
    },
  };
};

const editVendedorHandler = ($editVendedor) => {
  const $form = $editVendedor.getElementsByTagName('form')[0];
  const $submit = $editVendedor.getElementsByTagName('button')[0];

  const setFields = (v) => {
    Array.from($form.elements).forEach(($input) => {
      $input.dataset.value = $input.value = v ? v[$input.name] : '';
    });
  };

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if ($form.checkValidity()) {
      $form.classList.add('was-validated');
      const data = Array.from($form.elements).reduce(
        (prev, el) => (el.name ? { ...prev, [el.name]: el.value } : prev),
        {}
      );

      const isNew = !data.id;

      apiService('vendedores', {
        op: isNew ? 'create' : 'update',
        id: data.id,
        data,
      }).then((data) => {
        if (data) {
          if (isNew) {
            router.replace(`/vendedor/edit/${data.id}`);
          } else {
            setFields(data);
          }
        }
      });
    }
  };

  for (let $input of $form.getElementsByTagName('input')) {
    $input.onkeydown = (ev) => {
      $form.classList.remove('was-validated');
      $submit.disabled = true;
      for (let $i of $form.getElementsByTagName('input')) {
        if ($i.value !== $i.dataset.value) {
          $submit.disabled = false;
          break;
        }
      }
    };
  }

  const render = ({ id }) => {
    $form.classList.remove('was-validated');
    if (id) {
      apiService('vendedores', {
        op: 'get',
        id,
      }).then((v) => {
        $form.getElementsByClassName('btn')[0].textContent = 'Modificar';
        setFields(v);
        _show($editVendedor);
      });
    } else {
      $form.getElementsByClassName('btn')[0].textContent = 'Agregar';
      setFields();
      _show($editVendedor);
    }
  };

  return {
    render,
    hide: () => _hide($editVendedor),
  };
};

const listVentasHandler = ($listVentas) => {
  const $tableVentas = D.getElementById('tableVentas');
  const $tbodyVentas = $tableVentas.getElementsByTagName('tbody')[0];
  const $tplVentas = D.getElementById('tplVentas');

  $tableVentas.onclick = (ev) => {
    ev.preventDefault();
    const $t = ev.target;
    const action = $t.closest('.action')?.dataset.action;
    if (action) {
      const id = $t.closest('tr').dataset.id;
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
                })
              );
            })
            .then((result) => {
              if (result !== false) {
                router.replace(`/ventas`, true);
              }
            });
          break;
        case 'showVendedor':
          const idVendedor = $t.closest('.action')?.dataset.idVendedor;
          router.push(`/vendedor/${idVendedor}`);
          break;
      }
    }
  };

  const fillRow = ($row, v) => {
    $row.dataset.id = v.id;
    $row.getElementsByClassName('fecha')[0].textContent = formatDate(
      new Date(v.fecha)
    );
    $row.getElementsByClassName('concepto')[0].textContent = v.concepto;
    $row.getElementsByClassName('vendedor')[0].textContent = v.vendedor;
    $row.getElementsByClassName('idVendedor')[0].dataset.idVendedor =
      v.idVendedor;
    $row.getElementsByClassName('cantidad')[0].textContent = v.cantidad;
    $row.getElementsByClassName('precioUnitario')[0].textContent =
      formatCurrency(v.precioUnitario);
    $row
      .getElementsByClassName('iva')[0]
      .classList.add(v.iva ? 'bi-check-square' : 'bi-square');
    $row.getElementsByClassName('precioTotal')[0].textContent = formatCurrency(
      v.cantidad * v.precioUnitario
    );
  };
  const render = (options) => {
    setTitle('Ventas');
    _show($listVentas);

    apiService('ventas', {
      op: 'list',
      options,
    }).then((ventas) => {
      const $$tr = Array.from($tbodyVentas.getElementsByTagName('tr'));
      $$tr.forEach(($row, index) => {
        if (index >= ventas.length) {
          _hide($row);
        } else {
          _show($row);
          fillRow($row, ventas[index]);
        }
      });

      ventas.slice($$tr.length).forEach((v) => {
        const $row = $tplVentas.content.cloneNode(true).firstElementChild;
        fillRow($row, v);
        $tbodyVentas.append($row);
      });
      Array.from($tableVentas.getElementsByClassName('idVendedor')).forEach(
        ($el) => {
          if (!!options.idVendedor) _show($el);
          else _hide($el);
        }
      );
    });
  };
  return {
    render,
    hide: () => _hide($listVentas),
  };
};

// Routing

// Routing table

const routes = [
  {
    path: '/',
    module: showAndHideHandler(D.getElementById('welcome')),
    heading: 'Welcome',
  },
  {
    path: '/vendedores',
    module: listVendedoresHandler(D.getElementById('listVendedores')),
    heading: 'Vendedores',
  },
  {
    path: '/vendedor/edit/:id',
    module: editVendedorHandler(D.getElementById('editVendedor')),
    heading: 'Modificar vendedor',
  },
  {
    path: '/vendedor/new',
    module: editVendedorHandler(D.getElementById('editVendedor')),
    heading: 'Agregar vendedor',
  },
  {
    path: '/vendedor/:id',
    module: showVendedorHandler(D.getElementById('showVendedor')),
    heading: 'Vendedor',
  },
  {
    path: '/ventas',
    module: listVentasHandler(D.getElementById('listVentas')),
    heading: 'Ventas',
  },
  {
    path: '*',
    module: showAndHideHandler(D.getElementById('notFound')),
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

function matchPath(refresh) {
  error.hide(); // Just in case there is any open
  const path = location.pathname;
  const fullPath = path + location.search;
  if (refresh || fullPath !== currentPath) {
    currentPath = fullPath;
    routes.some((r) => {
      if (r.$_rx.test(path)) {
        currentModule?.hide();
        currentModule = r.module;
        currentModule.render({
          ...(path.match(r.$_rx)?.groups || {}),
          ...Object.fromEntries(new URLSearchParams(location.search)),
        });
        D.getElementsByTagName('h1')[0].textContent = r.heading;
        return true;
      }
    });
  }
}

// Here we start activating the application.
// So far, nothing is visible

// The navBar
const navBar = navBarHandler(D.getElementById('navbarMenu'));

// routing
matchPath();

window.onpopstate = () => {
  matchPath();
};
