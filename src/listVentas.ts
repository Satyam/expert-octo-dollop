import {
  getFirstByTag,
  getById,
  getTarget,
  getClosest,
  cloneTemplate,
  getAllByClass,
} from './gets';
import apiService from './apiService';
import { show, hide, fillRow, setTitle, router } from './utils';
import { confirmar } from './popups';

export const listVentas: Handler<{ idVendedor?: ID }> = ($el) => {
  const $listVentas = $el || getById('listVentas');
  const $tableVentas = getFirstByTag<HTMLTableElement>($listVentas, 'table');
  const $tbodyVentas = getFirstByTag<HTMLTableSectionElement>(
    $tableVentas,
    'tbody'
  );
  const $tplVentas = getFirstByTag<HTMLTemplateElement>(
    $listVentas,
    'template'
  );

  $tableVentas.addEventListener('click', (ev) => {
    ev.preventDefault();
    const $t = getTarget(ev);
    const action = getClosest($t, '.action')?.dataset.action;
    if (action) {
      const id = getClosest($t, 'tr').dataset.id;
      switch (action) {
        case 'add':
          router.push('/venta/new');
          break;
        case 'show':
          router.push(`/venta/${id}`);
          break;
        case 'edit':
          router.push(`/venta/edit/${id}`);
          break;
        case 'delete':
          confirmar
            .ask('¿Quiere borrar esta venta?', undefined, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('ventas', {
                  op: 'remove',
                  id,
                })
              );
            })
            .then(() => {
              router.replace(`/ventas`, true);
            });
          break;
        case 'showVendedor':
          const idVendedor = getClosest($t, '.action')?.dataset.idVendedor;
          router.push(`/vendedor/${idVendedor}`);
          break;
      }
    }
  });

  return {
    render: (options) => {
      setTitle('Ventas');
      show($listVentas);

      apiService<{}, VentaYVendedor[]>('ventas', {
        op: 'list',
        options,
      }).then((ventas) => {
        $tbodyVentas.replaceChildren();
        ventas.forEach((v) => {
          const $row = cloneTemplate<HTMLTableRowElement>($tplVentas);
          fillRow<Venta & { precioTotal: number }>(
            $row,
            {
              ...v,
              precioTotal: (v.cantidad || 0) * (v.precioUnitario || 0),
            },
            {
              idVendedor: ($el, venta) =>
                ($el.dataset.idVendedor = String(venta.idVendedor)),
              iva: 'boolean',
              precioUnitario: 'currency',
              precioTotal: 'currency',
              fecha: 'date',
            }
          );
          $tbodyVentas.append($row);
        });
        getAllByClass($tableVentas, 'idVendedor').forEach(($el) => {
          $el.classList.toggle('hidden', !!options.idVendedor);
        });
      });
    },
    close: () => hide($listVentas),
  };
};

export default listVentas;
