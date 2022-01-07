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
    matchPath(path, refresh);
  },
  replace: (path, refresh) => {
    H.replaceState({ path }, '', path);
    matchPath(path, refresh);
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

const confirmar = (() => {
  const $confirm = D.getElementById('confirm');

  const hide = () => {
    $confirm.classList.remove('show');
    $confirm.style.display = 'none';
  };
  const ask = (msg, header, danger) =>
    new Promise((resolve) => {
      $confirm.querySelector('.modal-body').textContent = msg;
      $confirm.querySelector('.modal-title').textContent =
        header ?? '¿Está seguro?';
      const $headerClass = $confirm.querySelector('.modal-header').classList;
      $headerClass.toggle('bg-danger', danger);
      $headerClass.toggle('text-white', danger);
      $yesClass = $confirm.querySelector('.yes').classList;
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
})();

const listVendedores = (() => {
  const $listVendedores = D.getElementById('listVendedores');
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
          router.push('/vendedor/edit/0');
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

const editVendedor = (() => {
  const $editVendedor = D.getElementById('editVendedor');
  const $form = $editVendedor.querySelector('form');
  const $submit = $editVendedor.querySelector('button');

  const setFields = (v) => {
    Array.from($form.elements).forEach(($input) => {
      $input.dataset.value = $input.value = v ? v[$input.name] : '';
    });
  };

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if ($form.checkValidity()) {
      const data = Array.from($form.elements).reduce(
        (prev, el) => (el.name ? { ...prev, [el.name]: el.value } : prev),
        {}
      );

      apiService('vendedores', {
        op: !!data.id ? 'update' : 'create',
        id: data.id,
        data,
      }).then((data) => {
        if (data) setFields(data);
      });
    }
    $form.classList.add('was-validated');
  };

  $form.querySelectorAll('input').forEach((input) => {
    input.onkeydown = (ev) => {
      $form.classList.remove('was-validated');
      $submit.disabled = !Array.from($form.querySelectorAll('input')).some(
        ($i) => $i.value !== $i.dataset.value
      );
    };
  });

  const render = ([path, id]) => {
    $form.classList.remove('was-validated');
    if (id === '0') {
      $form.querySelector('.btn').textContent = 'Agregar';
      $editVendedor.querySelector('h1').textContent = 'Agregar vendedor';
      setFields();
      show($editVendedor);
    } else {
      apiService('vendedores', {
        op: 'get',
        id,
      }).then((v) => {
        $form.querySelector('.btn').textContent = 'Modificar';
        $editVendedor.querySelector('h1').textContent = 'Modificar vendedor';
        setFields(v);
        show($editVendedor);
      });
    }
  };

  return {
    render,
    hide: () => hide($editVendedor),
    path: /\/vendedor\/edit\/([^\/]+)$/,
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

const modules = [
  listVendedores,
  showVendedor,
  editVendedor,
  /* notFound should always be last */
  notFound,
];

let currentModule = null;
let currentPath = '';

function matchPath(path, refresh) {
  error.hide();
  if (refresh || path !== currentPath) {
    currentPath = path;
    modules.some((module) => {
      const match = module.path.exec(path);
      if (match) {
        currentModule?.hide();
        module.render(match);
        currentModule = module;
        return true;
      }
    });
  }
}

matchPath(location.pathname);

window.onpopstate = () => {
  matchPath(location.pathname);
};
