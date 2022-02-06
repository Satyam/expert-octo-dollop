import { getFirstByTag, getFirstByClass, getById } from './gets';
import Form from './form';
import apiService from './apiService';
import { show, hide, router } from './utils';

export const editVendedor: Handler<{ id: ID }> = ($el) => {
  const $editVendedor = $el || getById('editVendedor');

  const form = new Form<Vendedor>(
    getFirstByTag<HTMLFormElement>($editVendedor, 'form'),
    (data) => {
      if (data) {
        const isNew = !data.id;

        apiService<Vendedor>('vendedores', {
          op: isNew ? 'create' : 'update',
          id: data.id,
          data,
        }).then((data) => {
          if (data) {
            if (isNew) {
              router.replace(`/vendedor/edit/${data.id}`);
            } else {
              form.setForm(data);
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
        apiService<{}, Vendedor>('vendedores', {
          op: 'get',
          id,
        }).then((v) => {
          if (form.submitButton) form.submitButton.textContent = 'Modificar';
          form.setForm(v);
          show($editVendedor);
        });
      } else {
        if (form.submitButton) form.submitButton.textContent = 'Agregar';
        show($editVendedor);
      }
    },
    close: () => hide($editVendedor),
  };
};

export default editVendedor;
