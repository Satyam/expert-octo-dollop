import { getFirstByClass, getTarget, getAllByClass, getClosest } from '../gets';
import { router } from '../routing';
import apiService from '../apiService';

import { logout } from '../login/login';

export const navBar = ($navbar: HTMLElement) => {
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