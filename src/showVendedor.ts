import { getFirstByTag, getFirstByClass, getById } from './gets';
import apiService from './apiService';
import { show, hide } from './utils';
import Form from './form';
import Accordion, { AccordionPanelEventDetails } from './accordion';
import listVentas from './listVentas';

export const showVendedor: Handler<{ id: ID }> = ($el) => {
  const $showVendedor = $el || getById('showVendedor');
  // `listVentas` is not a template but a plain node, don't use `cloneTemplate` on it.
  const $panelVentas = <HTMLElement>getById('listVentas').cloneNode(true);
  $panelVentas.removeAttribute('id');

  const accordion = new Accordion(getFirstByClass($showVendedor, 'accordion'), {
    ventas: 'Ventas',
    consigna: 'Consigna',
  });

  return {
    render: ({ id }) => {
      const form = new Form<Vendedor>(getFirstByTag($showVendedor, 'form'));

      accordion.addEventListener('openPanel', ((
        ev: CustomEvent<AccordionPanelEventDetails>
      ) => {
        const { panelName, $body } = ev.detail;
        switch (panelName) {
          case 'ventas':
            if ($body.children.length === 0) $body.append($panelVentas);
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
          form.setForm(v);
          show($showVendedor);
        }
      });
    },
    close: () => {
      accordion.closeAllPanels();
      hide($showVendedor);
    },
  };
};
export default showVendedor;
