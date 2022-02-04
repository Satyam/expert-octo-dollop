import { getById, getFirstByClass, getFirstByTag } from './gets';
import apiService from './apiService';
import { readForm, resetForm, watchFormChanges } from './form';
import { show, hide, router } from './utils';

export function setUser(user: Partial<User>) {
  if (user && user.nombre) {
    const $container = getById('container');
    $container.classList.replace('not-logged-in', 'is-logged-in');
    const $navbar = getById('navbar');
    getFirstByClass($navbar, 'user-name').textContent = user.nombre;
  }
}

export function isLoggedIn() {
  return getById('container').classList.contains('is-logged-in');
}

export function checkLoggedIn() {
  return apiService<{}, User>('auth', {
    op: 'isLoggedIn',
  }).then((user) => {
    if (user) {
      setUser(user);
      setTimeout(checkLoggedIn, 1_800_000);
    } else {
      if (isLoggedIn()) logout();
    }
  });
}
export const login: Handler<void> = ($el) => {
  const $login = $el || getById('login');
  const $form = getFirstByTag<HTMLFormElement>($login, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($login, 'button');

  $form.addEventListener('submit', (ev) => {
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
  });

  watchFormChanges($form, $submit);

  return {
    render: () => {
      resetForm($form);
      show($login);
    },
    close: () => hide($login),
  };
};

export function logout() {
  // To ensure everything is erased, do actually navigate and get everything refreshed
  location.replace('/');
}
