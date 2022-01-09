// Constants
const D = document;
const W = window;
const H = W.history;

const HIDDEN = 'hidden';
// Helpers

const setTitle = (title) =>
  (document.title = title ? `La Corazón - ${title}` : 'La Corazón');

const show = ($) => {
  $.classList.remove(HIDDEN);
};
const hide = ($) => {
  $.classList.add(HIDDEN);
};

const router = {
  push: (path, refresh) => {
    H.pushState({ path }, '', path);
    matchPath(refresh);
  },
  replace: (path, refresh) => {
    H.replaceState({ path }, '', path);
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

const handleAccordion = ($a, fn) => {
  const IS_OPEN = 'is-open';
  const openPanel = ($panel) => {
    if (!$panel) return;
    $panel.classList.add(IS_OPEN);
    $panel
      .getElementsByTagName('i')[0]
      .classList.replace('bi-caret-down-fill', 'bi-caret-up-fill');
    $panel.nextElementSibling.classList.add('show');
    if (typeof fn === 'function') {
      fn($panel.dataset.panel, $panel.nextElementSibling);
    }
  };

  const closePanel = ($panel) => {
    if (!$panel) return;
    $panel.classList.remove(IS_OPEN);
    $panel
      .getElementsByTagName('i')[0]
      .classList.replace('bi-caret-up-fill', 'bi-caret-down-fill');
    $panel.nextElementSibling.classList.remove('show');
  };

  $a.onclick = (ev) => {
    ev.preventDefault();
    const $panel = ev.target.closest('.card-header');
    if (!$panel) return;
    if ($panel.classList.contains(IS_OPEN)) {
      closePanel($panel);
    } else {
      closePanel($a.getElementsByClassName('is-open')[0]);
      openPanel($panel);
    }
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
    if (path === W.location.pathname) return;

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
    render: () => show($el),
    hide: () => hide($el),
  };
};

const loading = showAndHideHandler(D.getElementById('loading'));

const errorHandler = ($error) => {
  return {
    render: (msg) => {
      $error.getElementsByClassName('msg')[0].textContent = msg;
      show($error);
    },
    hide: () => hide($error),
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
    show($listVendedores);
    apiService('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      const $$tr = Array.from($tbodyVendedores.getElementsByTagName('tr'));
      $$tr.forEach(($row, index) => {
        if (index >= vendedores.length) {
          hide($row);
        } else {
          show($row);
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
    hide: () => hide($listVendedores),
  };
};

const showVendedorHandler = ($showVendedor) => {
  handleAccordion(
    $showVendedor.getElementsByClassName('accordion')[0],
    (panel, $panelBody) => {
      console.log(panel, $panelBody);
      switch (panel) {
        case 'ventas':
          break;
        case 'consigna':
          break;
      }
    }
  );

  const render = ({ id }) => {
    apiService('vendedores', {
      op: 'get',
      id,
    }).then((v) => {
      if (v) {
        $showVendedor.getElementsByClassName('nombre')[0].value = v.nombre;
        $showVendedor.getElementsByClassName('email')[0].value = v.email;
        show($showVendedor);
      }
    });
  };
  return {
    render,
    hide: () => hide($showVendedor),
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
        $editVendedor.getElementsByTagName('h1')[0].textContent =
          'Modificar vendedor';
        setFields(v);
        show($editVendedor);
      });
    } else {
      $form.getElementsByClassName('btn')[0].textContent = 'Agregar';
      $editVendedor.getElementsByTagName('h1')[0].textContent =
        'Agregar vendedor';
      setFields();
      show($editVendedor);
    }
  };

  return {
    render,
    hide: () => hide($editVendedor),
  };
};

// Routing
const urlMatch = (pattern, url) => {
  const patts = pattern.split('/');
  const us = url.split('/');
  const params = {};

  for (let i = 0; i < patts.length; i++) {
    const p = patts[i];
    if (p === us[i]) continue;
    if (p.startsWith(':')) {
      params[p.substring(1)] = us[i];
      continue;
    }
    if (p === '*') {
      params.$ = us.slice(i).join('/');
      break;
    }
    return false;
  }

  return params;
};

const routes = [
  { path: '/', module: showAndHideHandler(D.getElementById('welcome')) },
  {
    path: '/vendedores',
    module: listVendedoresHandler(D.getElementById('listVendedores')),
  },
  {
    path: '/vendedor/edit/:id',
    module: editVendedorHandler(D.getElementById('editVendedor')),
  },
  {
    path: '/vendedor/new',
    module: editVendedorHandler(D.getElementById('editVendedor')),
  },
  {
    path: '/vendedor/:id',
    module: showVendedorHandler(D.getElementById('showVendedor')),
  },
  { path: '*', module: showAndHideHandler(D.getElementById('notFound')) },
];

let currentModule = null;
let currentPath = '';

function matchPath(refresh) {
  error.hide();
  const path = location.pathname;
  const fullPath = path + location.search;
  if (refresh || fullPath !== currentPath) {
    currentPath = fullPath;
    routes.some((r) => {
      const params = urlMatch(r.path, path);
      if (params) {
        currentModule?.hide();
        currentModule = r.module;
        currentModule.render({
          ...params,
          ...Object.fromEntries(new URLSearchParams(location.search)),
        });
        return true;
      }
    });
  }
}

// Here we start initializing the application

// First, associate the handlers to each piece of HTML

// The navBar
const navBar = navBarHandler(D.getElementById('navbarMenu'));

matchPath();

window.onpopstate = () => {
  matchPath();
};
