// Constants, helpers
const D = document;
const W = window;
const H = W.history;
// Application state
// State accessor functions (getters and setters)
// DOM node references
let $navItemActive = null;
const $navbarMenu = D.getElementById('navbarMenu');

// DOM update functions
// Event handlers
const onNavbarMenu = (ev) => {
  ev.preventDefault();
  $navItemActive?.classList.remove('active');
  $navItemActive = ev.target.closest('.nav-item');
  const path = $navItemActive.dataset.path;
  $navItemActive.classList.add('active');

  H.pushState(path, '', path);
};
// Event handler bindings
$navbarMenu.onclick = onNavbarMenu;
// Initial setup
