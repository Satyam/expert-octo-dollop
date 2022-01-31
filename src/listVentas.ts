import {
  getFirstByTag,
  getById,
  getTarget,
  getClosest,
  getAllByTag,
  cloneTemplate,
  getAllByClass,
} from './gets';
import apiService from './apiService';
import {
  show,
  hide,
  fillRow,
  setTitle,
  formatCurrency,
  formatDate,
  router,
} from './utils';
import { confirmar } from './popups';

export const listVentas: Handler<{ idVendedor?: ID }> = ($el) => {
  const $listVentas = $el || getById('listVentas');
  const $tableVentas = getById('tableVentas');
  const $tbodyVentas = getFirstByTag<HTMLTableSectionElement>(
    $tableVentas,
    'tbody'
  );
  const $tplVentas = getById('tplVentas') as HTMLTemplateElement;

  $tableVentas.onclick = (ev) => {
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
  };

  const fr = ($row: HTMLTableRowElement, v: Venta) =>
    fillRow<
      Omit<Venta, 'precioUnitario' | 'fecha'> & {
        precioTotal: string;
        precioUnitario: string;
        fecha: string;
      }
    >(
      $row,
      {
        ...v,
        precioTotal: formatCurrency(
          (v.cantidad || 0) * (v.precioUnitario || 0)
        ),
        precioUnitario: formatCurrency(v.precioUnitario || 0),
        fecha: formatDate(new Date(v.fecha)),
      },
      (name, $el, venta) => {
        switch (name) {
          case 'idVendedor':
            $el.dataset.idVendedor = String(venta.idVendedor);
            return true;
          case 'iva':
            $el.classList.add(venta.iva ? 'bi-check-square' : 'bi-square');
            return true;
          default:
            return false;
        }
      }
    );

  const render = (options) => {
    setTitle('Ventas');
    show($listVentas);

    apiService<{}, VentaYVendedor[]>('ventas', {
      op: 'list',
      options,
    }).then((ventas) => {
      const $$tr = getAllByTag<HTMLTableRowElement>($tbodyVentas, 'tr');
      $$tr.forEach(($row, index) => {
        if (index >= ventas.length) {
          $row.classList.add('hidden');
        } else {
          $row.classList.remove('hidden');
          fr($row, ventas[index]);
        }
      });

      ventas.slice($$tr.length).forEach((v) => {
        const $row = cloneTemplate<HTMLTableRowElement>($tplVentas);
        fr($row, v);
        $tbodyVentas.append($row);
      });
      getAllByClass($tableVentas, 'idVendedor').forEach(($el) => {
        $el.classList.toggle('hidden', !!options.idVendedor);
      });
    });
  };
  return {
    render,
    close: () => hide($listVentas),
  };
};

export default listVentas;
