import { getFirstByTag, getFirstByClass, getById } from './gets';
import Form from './form';
import apiService from './apiService';
import { show, hide, router } from './utils';

type FormData = Venta & { precioTotal: number };

export const editVenta: Handler<{ id: ID }> = ($el) => {
  const $editVenta = $el || getById('editVenta');

  const form = new Form<FormData>(
    getFirstByTag<HTMLFormElement>($editVenta, 'form'),
    ({ precioTotal, ...venta }) => {
      if (venta) {
        const isNew = !venta.id;

        apiService<Venta, Venta>('ventas', {
          op: isNew ? 'create' : 'update',
          id: venta.id,
          venta,
        }).then((venta) => {
          if (venta) {
            if (isNew) {
              router.replace(`/venta/edit/${venta.id}`);
            } else {
              form.setForm({
                ...venta,
                precioTotal:
                  (venta.cantidad || 0) * (venta.precioUnitario || 0),
              });
            }
          }
        });
      }
    }
  );

  return {
    render: ({ id }) => {
      form.resetForm();
      if (id) {
        apiService<{}, Venta>('ventas', {
          op: 'get',
          id,
        }).then((venta) => {
          if (form.submitButton) form.submitButton.textContent = 'Modificar';
          form.setForm({
            ...venta,
            precioTotal: (venta.cantidad || 0) * (venta.precioUnitario || 0),
          });
          show($editVenta);
        });
      } else {
        if (form.submitButton) form.submitButton.textContent = 'Agregar';
        form.setForm({
          fecha: new Date(),
        } as FormData);
        show($editVenta);
      }
    },
    close: () => hide($editVenta),
  };
};

export default editVenta;
