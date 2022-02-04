import { getFirstByClass, getClosest, getTarget, getById } from './gets';
import { show, hide } from './utils';

export const showAndHideHandler: Handler<void> = ($el) => {
  return {
    render: () => $el && show($el),
    close: () => $el && hide($el),
  };
};

export const loading = showAndHideHandler(getById('loading'));

export const errorHandler = ($error: HTMLElement) => {
  return {
    render: (msg: string) => {
      getFirstByClass($error, 'msg').textContent = msg;
      show($error);
    },
    close: () => hide($error),
  };
};

export const error = errorHandler(getById('error'));

export const confirmarHandler = ($confirm: HTMLElement) => {
  const close = () => {
    $confirm.classList.remove('show');
    $confirm.style.display = 'none';
  };
  const ask = (msg: string, header?: string, danger?: boolean) =>
    new Promise((resolve) => {
      getFirstByClass($confirm, 'modal-body').textContent = msg;
      getFirstByClass($confirm, 'modal-title').textContent =
        header ?? '¿Está seguro?';
      const $headerClass = getFirstByClass($confirm, 'modal-header').classList;
      $headerClass.toggle('bg-danger', danger);
      $headerClass.toggle('text-white', danger);
      const $yesClass = getFirstByClass($confirm, 'yes').classList;
      $yesClass.toggle('btn-danger', danger);
      $yesClass.toggle('btn-primary', !danger);

      $confirm.style.display = 'block';
      $confirm.classList.add('show');
      $confirm.addEventListener('click', (ev) => {
        ev.preventDefault();
        const $t = getClosest(getTarget(ev), '.action');
        switch ($t?.dataset.action) {
          case 'yes':
            close();
            resolve(true);
            break;
          case 'no':
            close();
            resolve(false);
            break;
        }
      });
    });
  return {
    ask,
    close,
  };
};
export const confirmar = confirmarHandler(getById('confirm'));
