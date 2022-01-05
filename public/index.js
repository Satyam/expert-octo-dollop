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
  push: (path, title) => {
    H.pushState({ path }, '', path);
    matchPath(path);
  },
  replace: (path, title) => {
    H.replaceState({ path }, '', path);
    matchPath(path);
  },
};

const apiService = (service, op) =>
  fetch(`${window.origin}/api/${service}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(op),
  });
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

const listVendedores = (() => {
  const $listVendedores = D.getElementById('listVendedores');
  const $tableVendedores = D.getElementById('tableVendedores');
  const $tbodyVendedores = $tableVendedores.getElementsByTagName('tbody')[0];
  const $tplVendedores = D.getElementById('tplVendedores');

  const state = {
    loading: true,
    authenticated: false,
    error: false,
    data: null,
  };

  const loadVendedores = () =>
    apiService('verify')
      .then((resp) => {
        state.authenticated = resp.ok;
        if (resp.ok)
          return apiService('vendedores', {
            op: 'list',
          });
      })
      .then((resp) => {
        state.error = !resp.ok;
        if (resp && resp.ok) return resp.json();
      })
      .then((data) => {
        state.data = data ?? null;
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
        state.error = true;
        state.data = null;
      });

  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    loadVendedores().then(() => {
      state.data.forEach((v) => {
        const $row = $tplVendedores.content.cloneNode(true).firstElementChild;
        $row.dataset.id = v.id;
        $row.querySelector('.nombre').textContent = v.nombre;
        $row.querySelector('.email').textContent = v.email;

        $tbodyVendedores.append($row);
      });
    });
  };
  return {
    getState: () => state,
    loadVendedores,
    render,
    hide: () => hide($listVendedores),
    path: /\/vendedores/,
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
