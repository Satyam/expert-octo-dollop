import { getTarget, getAllByTag } from './gets';

export const handleAccordion = ($a: HTMLElement) => {
  const toggleHandler = (ev: Event) => {
    const $d = getTarget<HTMLDetailsElement>(ev);
    const panelName = $d.dataset.panel;
    if (panelName) {
      if ($d.open) {
        openPanel(panelName);
      } else {
        closePanel(panelName);
      }
    }
  };

  const panels = getAllByTag<HTMLDetailsElement>($a, 'details').reduce(
    ($$ps, $p) => {
      $p.addEventListener('toggle', toggleHandler);
      const panelName = $p.dataset.panel;
      return panelName
        ? {
            ...$$ps,
            [panelName]: $p,
          }
        : $$ps;
    },
    {}
  );

  let currentOpen: string | undefined | null;

  const closePanel = (panelName: string) => {
    const $panel = panels[panelName];
    if (!$panel) return;
    if (panelName === currentOpen) {
      currentOpen = null;
      $panel.open = false;
      $panel.children[1].dispatchEvent(
        new CustomEvent('closePanel', {
          bubbles: true,
          detail: panelName,
        })
      );
    }
  };

  const openPanel = (panelName: string) => {
    const $panel = panels[panelName];
    if (!$panel) return;
    if (currentOpen) closePanel(currentOpen);
    currentOpen = panelName;
    $panel.open = true;
    $panel.children[1].dispatchEvent(
      new CustomEvent('openPanel', {
        bubbles: true,
        detail: panelName,
      })
    );
  };

  const togglePanel = (panelName: string) => {
    if (panelName === currentOpen) {
      closePanel(panelName);
    } else {
      openPanel(panelName);
    }
  };

  const closeAllPanels = () => closePanel(currentOpen || '');

  return {
    openPanel,
    closePanel,
    togglePanel,
    closeAllPanels,
    getOpenPanel: () => currentOpen,
  };
};
