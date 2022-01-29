type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLButtonElement;

const getElements = ($form: HTMLFormElement): FormElement[] =>
  Array.from($form.elements) as FormElement[];

export const setForm = ($form: HTMLFormElement, v: Record<string, any>) => {
  getElements($form).forEach(($input) => {
    $input.dataset.value = $input.value = v[$input.name] || '';
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
