const showVendedorHandler: Module<{ id: ID }> = ($showVendedor) => {
  // `listVentas` is not a template but a plain node, don't use `cloneTemplate` on it.
  const $panelVentas = <HTMLElement>getById('listVentas').cloneNode(true);
  const $accordion = getFirstByClass($showVendedor, 'accordion');
  const { closeAllPanels } = handleAccordion($accordion);

  const render = ({ id }) => {
    $accordion.addEventListener('openPanel', ((ev: CustomEvent) => {
      const $panelBody = getTarget(ev);
      switch (ev.detail) {
        case 'ventas':
          if ($panelBody.children.length === 0) $panelBody.append($panelVentas);
          listVentasHandler($panelVentas).render({ idVendedor: id });
          break;
        case 'consigna':
          break;
      }
    }) as EventListener);

    apiService<{}, Vendedor>('vendedores', {
      op: 'get',
      id,
    }).then((v) => {
      if (v) {
        setForm(getFirstByTag($showVendedor, 'form'), v);
        show($showVendedor);
      }
    });
  };

  return {
    render,
    close: () => {
      closeAllPanels();
      hide($showVendedor);
    },
  };
};
