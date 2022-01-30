import { getById, getFirstByClass, getFirstByTag } from '../gets';
import apiService from '../apiService';
import { readForm, resetForm, watchFormChanges } from '../form';
import { router } from '../routing';
import { show, hide } from '../utils';

export const setUser = (user: Partial<User>) => {
  if (user && user.nombre) {
    const $container = getById('container');
    $container.classList.replace('not-logged-in', 'is-logged-in');
    const $navbar = getById('navbar');
    getFirstByClass($navbar, 'user-name').textContent = user.nombre;
  }
};

export const isLoggedIn = () =>
  getById('container').classList.contains('is-logged-in');

export const checkLoggedIn = () =>
  apiService<{}, User>('auth', {
    op: 'isLoggedIn',
  }).then((user) => {
    if (user) {
      setUser(user);
      setTimeout(checkLoggedIn, 1_800_000);
    } else {
      if (isLoggedIn()) logout();
    }
  });

checkLoggedIn();

export const login: Module<void> = ($login) => {
  const $form = getFirstByTag<HTMLFormElement>($login, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($login, 'button');

  $form.onsubmit = (ev) => {
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
  };

  watchFormChanges($form, $submit);

  const render = () => {
    resetForm($form);
    show($login);
  };

  return {
    render,
    close: () => hide($login),
  };
};

export const logout = () => {
  // To ensure everything is erased, do actually navigate and get everything refreshed
  location.replace('/');
};
