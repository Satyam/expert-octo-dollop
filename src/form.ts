import { getAllByTag } from './gets';

export const setForm = ($form: HTMLFormElement, v: Record<string, any>) => {
  getAllByTag<HTMLInputElement>($form, 'input').forEach(($input) => {
    $input.dataset.value = $input.value = v[$input.name] || '';
  });
};

export const readForm = <D extends Record<string, any>>(
  $form: HTMLFormElement
): D | undefined => {
  $form.classList.add('was-validated');
  if ($form.checkValidity()) {
    return getAllByTag<HTMLInputElement>($form, 'input').reduce(
      (prev, el) => (el.name ? { ...prev, [el.name]: el.value } : prev),
      {} as D
    );
  }
  return undefined;
};

export const watchFormChanges = (
  $form: HTMLFormElement,
  $submit: HTMLButtonElement
) => {
  getAllByTag<HTMLInputElement>($form, 'input').forEach(($input) => {
    $input.oninput = () => {
      $submit.disabled = true;
      getAllByTag<HTMLInputElement>($form, 'input').some(($i) => {
        if ($i.value !== $i.dataset.value) {
          $submit.disabled = false;
          return true;
        }
      });
    };
  });
};
