import { getFirstByTag, getFirstByClass, getById, getTarget } from './gets';
import apiService from './apiService';
import { show, hide } from './utils';
import { setForm } from './form';
import handleAccordion from './accordion';
import listVentas from './listVentas';

export const showVendedor: Handler<{ id: ID }> = ($el) => {
  const $showVendedor = $el || getById('showVendedor');
  // `listVentas` is not a template but a plain node, don't use `cloneTemplate` on it.
  const $panelVentas = <HTMLElement>getById('listVentas').cloneNode(true);
  $panelVentas.removeAttribute('id');
  const $accordion = getFirstByClass($showVendedor, 'accordion');
  const { closeAllPanels } = handleAccordion($accordion);

  const render = ({ id }) => {
    $accordion.addEventListener('openPanel', ((ev: CustomEvent) => {
      const $panelBody = getTarget(ev);
      switch (ev.detail) {
        case 'ventas':
          if ($panelBody.children.length === 0) $panelBody.append($panelVentas);
          listVentas($panelVentas).render({ idVendedor: id });
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
export default showVendedor;
