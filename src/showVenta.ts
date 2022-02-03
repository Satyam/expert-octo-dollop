import { getFirstByTag, getFirstByClass, getById, getTarget } from './gets';
import apiService from './apiService';
import { show, hide } from './utils';
import { setForm } from './form';

export const showVenta: Handler<{ id: ID }> = ($el) => {
  const $showVenta = $el || getById('showVenta');

  const render = ({ id }) => {
    apiService<{}, Venta>('ventas', {
      op: 'get',
      id,
    }).then((v) => {
      if (v) {
        setForm(getFirstByTag($showVenta, 'form'), {
          ...v,
          precioTotal: v.cantidad * v.precioUnitario,
        });
        show($showVenta);
      }
    });
  };

  return {
    render,
    close: () => {
      hide($showVenta);
    },
  };
};
export default showVenta;
