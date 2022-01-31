import confirma from './confirma.html';
import editVendedor from './editVendedor.html';
import error from './error.html';
import home from './home.html';
import listVendedores from './listVendedores.html';
import listVentas from './listVentas.html';
import loading from './loading.html';
import login from './login.html';
import navbar from './navbar.html';
import notFound from './notFound.html';
import showVendedor from './showVendedor.html';

export default function ($container: HTMLElement): void {
  $container.insertAdjacentHTML('beforeend', navbar);
  $container.insertAdjacentHTML('beforeend', notFound);
  $container.insertAdjacentHTML('beforeend', loading);
  $container.insertAdjacentHTML('beforeend', error);
  $container.insertAdjacentHTML('beforeend', confirma);
  $container.insertAdjacentHTML('beforeend', home);

  $container.insertAdjacentHTML('beforeend', login);
  $container.insertAdjacentHTML('beforeend', editVendedor);
  $container.insertAdjacentHTML('beforeend', listVendedores);
  $container.insertAdjacentHTML('beforeend', listVentas);
  $container.insertAdjacentHTML('beforeend', showVendedor);
}
