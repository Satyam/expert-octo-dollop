import { getTarget, getAllByTag } from './gets';

export type AccordionPanelEventDetails = {
  panelName: string;
  $panel: HTMLDetailsElement;
  $header: HTMLElement;
  $body: HTMLElement;
};

/**
 * @class Accordion
 *  Builds and accordion, allows handling of it and fires events after user interactions.
 */
export default class Accordion {
  private _currentOpen: string | null = null;
  private _panels: Record<string, AccordionPanelEventDetails> = {};
  private _a: HTMLElement;
  private _eventTarget: EventTarget;

  /**
   *
   * @param $a HTMLElement that will contain the accordion
   * @param panels Object with titles for the panels.  The key will serve as reference to the panel
   */
  constructor($a: HTMLElement, panels: Record<string, string>) {
    this._eventTarget = new EventTarget();
    this._a = $a;
    for (const panelName in panels) {
      const $panel = document.createElement('details');
      $panel.classList.add('card');
      $panel.dataset.panel = panelName;
      $panel.addEventListener('toggle', this._toggleHandler);
      const $header = document.createElement('summary');
      $header.classList.add('card-header');
      $header.textContent = panels[panelName];
      $panel.appendChild($header);
      const $body = document.createElement('div');
      $body.classList.add('card-body');
      $panel.appendChild($body);
      $a.appendChild($panel);
      this._panels[panelName] = { panelName, $panel, $header, $body };
    }
  }

  private _toggleHandler = (ev: Event): void => {
    const $panel = getTarget<HTMLDetailsElement>(ev);
    const panelName = $panel.dataset.panel;
    if (panelName) {
      if ($panel.open) {
        this.openPanel(panelName);
      } else {
        this.closePanel(panelName);
      }
    }
  };

  get currentOpen(): string | null {
    return this._currentOpen;
  }

  addEventListener(name: string, callback: EventListener) {
    this._eventTarget.addEventListener(name, callback);
  }

  closePanel(panelName: string): void {
    const panel = this._panels[panelName];
    if (!panel) return;
    if (panelName === this._currentOpen) {
      this._currentOpen = null;
      panel.$panel.open = false;
      this._eventTarget.dispatchEvent(
        new CustomEvent('closePanel', {
          bubbles: true,
          detail: panel,
        })
      );
    }
  }

  openPanel(panelName: string): void {
    const panel = this._panels[panelName];
    if (!panel) return;
    if (this._currentOpen) this.closePanel(this._currentOpen);
    this._currentOpen = panelName;
    panel.$panel.open = true;
    this._eventTarget.dispatchEvent(
      new CustomEvent('openPanel', {
        bubbles: true,
        detail: panel,
      })
    );
  }

  togglePanel(panelName: string): void {
    if (panelName === this._currentOpen) {
      this.closePanel(panelName);
    } else {
      this.openPanel(panelName);
    }
  }

  closeAllPanels(): void {
    this.closePanel(this._currentOpen || '');
  }

  destroy(): void {
    getAllByTag<HTMLDetailsElement>(this._a, 'details').forEach(($p) => {
      $p.removeEventListener('toggle', this._toggleHandler);
    });
  }
}
