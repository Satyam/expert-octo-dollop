const editVendedorHandler: Module<{ id: ID }> = ($editVendedor) => {
  const $form = getFirstByTag<HTMLFormElement>($editVendedor, 'form');
  const $submit = getFirstByTag<HTMLButtonElement>($editVendedor, 'button');

  $form.onsubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const data = readForm<Partial<Vendedor>>($form);
    if (data) {
      const isNew = !data.id;

      apiService<Partial<Vendedor>>('vendedores', {
        op: isNew ? 'create' : 'update',
        id: data.id,
        data,
      }).then((data) => {
        if (data) {
          if (isNew) {
            router.replace(`/vendedor/edit/${data.id}`);
          } else {
            setForm($form, data);
          }
        }
      });
    }
  };
  watchFormChanges($form, $submit);

  const render = ({ id }) => {
    resetForm($form);
    if (id) {
      apiService<{}, Partial<Vendedor>>('vendedores', {
        op: 'get',
        id,
      }).then((v) => {
        getFirstByClass($form, 'btn').textContent = 'Modificar';
        setForm($form, v);
        show($editVendedor);
      });
    } else {
      getFirstByClass($form, 'btn').textContent = 'Agregar';
      show($editVendedor);
    }
  };

  return {
    render,
    close: () => hide($editVendedor),
  };
};
