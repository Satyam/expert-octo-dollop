import { formatDate, formatCurrency } from './utils';

type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLButtonElement;

const getElements = ($form: HTMLFormElement): FormElement[] =>
  Array.from($form.elements) as FormElement[];

export const setForm = ($form: HTMLFormElement, v: Record<string, any>) => {
  getElements($form).forEach(($input) => {
    const value = v[$input.name];
    switch ($input.nodeName.toLowerCase()) {
      case 'input':
        switch ($input.type) {
          case 'number':
            if ($input.dataset.currency) {
              $input.dataset.value = $input.value = Number(value).toFixed(2);
            } else {
              $input.dataset.value = $input.value = value;
            }
            break;
          case 'date':
            $input.dataset.value = $input.value = value.split('T')[0];
            break;
          case 'checkbox':
            (<HTMLInputElement>$input).checked = !!value;
            $input.dataset.value = String(!!value);
            break;
          default:
            $input.dataset.value = $input.value = String(value);
        }
        break;
      case 'textarea':
        $input.dataset.value = $input.innerHTML = value || '';
        break;
      case 'select':
        break;
    }
  });
};

export const readForm = <D extends Record<string, any>>(
  $form: HTMLFormElement
): D | undefined => {
  $form.classList.add('was-validated');
  if ($form.checkValidity()) {
    return Object.fromEntries(new FormData($form)) as D;
  }
  return undefined;
};

export const watchFormChanges = (
  $form: HTMLFormElement,
  $submit: HTMLButtonElement
) => {
  getElements($form).forEach(($input) => {
    $input.oninput = () => {
      $submit.disabled = true;
      getElements($form).some(($i) => {
        if ($i.value !== $i.dataset.value) {
          $submit.disabled = false;
          return true;
        }
      });
    };
  });
};

export const resetForm = ($form: HTMLFormElement) => {
  $form.reset();
  $form.classList.remove('was-validated');
};
