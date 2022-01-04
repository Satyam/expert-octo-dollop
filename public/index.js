// Constants
const D = document;
const W = window;
const H = W.history;

// Helpers
const setTitle = (title) =>
  (document.title = title ? `La Corazón - ${title}` : 'La Corazón');

const router = {
  push: (path, title) => {
    H.pushState({ path }, '', path);
    setTitle(title);
  },
  replace: (path, title) => {
    H.replaceState({ path }, '', path);
    setTitle(title);
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
let stateVendedores = {
  loading: true,
  authenticated: false,
  error: false,
  data: null,
};
let loadVendedores = () =>
  apiService('verify')
    .then((resp) => {
      stateVendedores.authenticated = resp.ok;
      if (resp.ok)
        return apiService('vendedores', {
          op: 'list',
        });
    })
    .then((resp) => {
      stateVendedores.error = !resp.ok;
      if (resp && resp.ok) return resp.json();
    })
    .then((data) => {
      stateVendedores.data = data ?? null;
      stateVendedores.loading = false;
    })
    .catch(() => {
      stateVendedores.loading = false;
      stateVendedores.error = true;
      stateVendedores.data = null;
    });

// State accessor functions (getters and setters)

// DOM node references
let $navItemActive = null;
const $navbarMenu = D.getElementById('navbarMenu');

// DOM update functions

// Event handlers
const onNavbarMenu = (ev) => {
  ev.preventDefault();
  const navItem = ev.target.closest('.nav-item');
  const { path, title } = navItem.dataset;
  if (path === W.location.pathname) return;

  $navItemActive?.classList.remove('active');
  $navItemActive = navItem;
  $navItemActive.classList.add('active');

  router.push(path, title);
};

// Event handler bindings
$navbarMenu.onclick = onNavbarMenu;

// Initial setup
loadVendedores().then(console.log);
