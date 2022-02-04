import { getFirstByTag, getFirstByClass, getById, getTarget } from './gets';
import apiService from './apiService';
import { show, hide, router } from './utils';
import { setForm } from './form';

export const showVenta: Handler<{ id: ID }> = ($el) => {
  const $showVenta = $el || getById('showVenta');
  const $vendedorLink = getFirstByTag($showVenta, 'a');
  let _listener: EventListener;
  getFirstByTag($showVenta, 'a').addEventListener('click', (ev) => {});

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
          setForm(getFirstByTag($showVenta, 'form'), {
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
