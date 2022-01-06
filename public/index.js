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
  push: (path) => {
    H.pushState({ path }, '', path);
    matchPath(path);
  },
  replace: (path) => {
    H.replaceState({ path }, '', path);
    matchPath(path);
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
  loading.show();
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
      error.show(err);
    });
};

// Application state
const navBar = (() => {
  let $navItemActive = null;
  const $navbarMenu = D.getElementById('navbarMenu');

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
})();

const loading = (() => {
  const $loading = D.getElementById('loading');
  return {
    show: () => show($loading),
    hide: () => hide($loading),
  };
})();

const error = (() => {
  const $error = D.getElementById('error');
  return {
    show: (msg) => {
      $error.querySelector('.msg').textContent = msg;
      show($error);
    },
    hide: () => hide($error),
  };
})();

const listVendedores = (() => {
  const $listVendedores = D.getElementById('listVendedores');
  const $tableVendedores = D.getElementById('tableVendedores');
  const $tbodyVendedores = $tableVendedores.getElementsByTagName('tbody')[0];
  const $tplVendedores = D.getElementById('tplVendedores');

  $tbodyVendedores.onclick = (ev) => {
    ev.preventDefault();
    const $t = ev.target;
    const action = $t.closest('[data-action]').dataset.action;
    if (action) {
      const id = $t.closest('tr').dataset.id;
      switch (action) {
        case 'show':
          router.push(`/vendedor/${id}`);
          break;
        case 'edit':
          router.push(`/vendedor/edit/${id}`);
          break;
        case 'delete':
          router.push(`/vendedor/delete/${id}`);
          break;
      }
    }
  };

  const fillRow = ($row, v) => {
    $row.dataset.id = v.id;
    $row.querySelector('.nombre').textContent = v.nombre;
    $row.querySelector('.email').textContent = v.email;
  };
  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    apiService('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      const $$tr = $tbodyVendedores.querySelectorAll('tr');
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
    path: /\/vendedores/,
  };
})();

const showVendedor = (() => {
  const $showVendedor = D.getElementById('showVendedor');
  const render = ([path, id]) => {
    apiService('vendedores', {
      op: 'get',
      id,
    }).then((v) => {
      $showVendedor.querySelector('.nombre').value = v.nombre;
      $showVendedor.querySelector('.email').value = v.email;
      show($showVendedor);
    });
  };
  return {
    render,
    hide: () => hide($showVendedor),
    path: /\/vendedor\/([^\/]+)$/,
  };
})();

const notFound = (() => {
  const $notFound = D.getElementById('notFound');
  return {
    render: () => show($notFound),
    hide: () => hide($notFound),
    path: /.*/,
  };
})();
// State accessor functions (getters and setters)

// DOM node references

// DOM update functions

// Event handlers

// Event handler bindings

// Initial setup

const modules = [
  listVendedores,
  showVendedor,
  /* notFound should always be last */
  notFound,
];

let currentModule = null;

function matchPath(path) {
  modules.some((module) => {
    const match = module.path.exec(path);
    if (match) {
      if (!currentModule || module !== currentModule) {
        currentModule?.hide();
        module.render(match);
        currentModule = module;
        return true;
      }
    }
  });
}

matchPath(location.pathname);

window.onpopstate = () => {
  matchPath(location.pathname);
};
