import {
  getFirstByTag,
  getById,
  getTarget,
  getClosest,
  getAllByTag,
  cloneTemplate,
} from './gets';
import apiService from './apiService';
import { show, hide, fillRow, setTitle, router } from './utils';
import { confirmar } from './popups';

export const listVendedores: Handler<void> = ($el) => {
  const $listVendedores = $el || getById('listVendedores');
  const $tableVendedores = getFirstByTag<HTMLTableElement>(
    $listVendedores,
    'table'
  );
  const $tbodyVendedores = getFirstByTag<HTMLTableSectionElement>(
    $tableVendedores,
    'tbody'
  );
  const $tplVendedores = getFirstByTag<HTMLTemplateElement>(
    $listVendedores,
    'template'
  );

  $tableVendedores.addEventListener('click', (ev) => {
    ev.preventDefault();
    const $t = getTarget(ev);
    const action = getClosest($t, '.action')?.dataset.action;
    if (action) {
      const id = getClosest($t, 'tr').dataset.id;
      switch (action) {
        case 'add':
          router.push('/vendedor/new');
          break;
        case 'show':
          router.push(`/vendedor/${id}`);
          break;
        case 'edit':
          router.push(`/vendedor/edit/${id}`);
          break;
        case 'delete':
          confirmar
            .ask('¿Quiere borrar este vendedor?', undefined, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('vendedores', {
                  op: 'remove',
                  id,
                })
              );
            })
            .then(() => {
              router.replace(`/vendedores`, true);
            });
          break;
      }
    }
  });

  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    apiService<{}, Vendedor[]>('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      $tbodyVendedores.replaceChildren();
      vendedores.forEach((v) => {
        const $row = cloneTemplate<HTMLTableRowElement>($tplVendedores);
        fillRow($row, v);
        $tbodyVendedores.append($row);
      });
    });
  };
  return {
    render,
    close: () => hide($listVendedores),
  };
};

export default listVendedores;
