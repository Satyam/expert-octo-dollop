import {
  getFirstByClass,
  getTarget,
  getAllByClass,
  getClosest,
  getById,
} from './gets';
import { router } from './utils';
import apiService from './apiService';
import { logout } from './login';

export default function ($el?: HTMLElement) {
  const $navbar = $el || getById('navbar');
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
    $menu.addEventListener('click', menuHandler);
  });

  $toggleBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    $collapse.classList.toggle('show');
  });

  $brand.addEventListener('click', (ev) => {
    ev.preventDefault();
    router.push('/');
  });
}
