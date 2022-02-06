import { getFirstByTag, getFirstByClass, getById, getTarget } from './gets';
import apiService from './apiService';
import { show, hide, router } from './utils';
import Form from './form';

export const showVenta: Handler<{ id: ID }> = ($el) => {
  const $showVenta = $el || getById('showVenta');
  const $vendedorLink = getFirstByTag($showVenta, 'a');
  const form = new Form<Venta & { precioTotal: number }>(
    getFirstByTag($showVenta, 'form')
  );
  let _listener: EventListener;

  return {
    render: ({ id }) => {
      apiService<{}, Venta>('ventas', {
        op: 'get',
        id,
      }).then((v) => {
        if (v) {
          _listener = (ev) => {
            ev.preventDefault();
            router.push(`/vendedor/${v.idVendedor}`);
          };
          $vendedorLink.addEventListener('click', _listener);
          form.setForm({
            ...v,
            precioTotal: (v.cantidad || 0) * (v.precioUnitario || 0),
          });
          show($showVenta);
        }
      });
    },
    close: () => {
      if (_listener) $vendedorLink.removeEventListener('click', _listener);
      hide($showVenta);
    },
  };
};
export default showVenta;
