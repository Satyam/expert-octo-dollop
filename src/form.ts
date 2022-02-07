type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLButtonElement;

export default class Form<D extends Record<string, any>> {
  private _f: HTMLFormElement;
  private _els: FormElement[];
  private _submitButton: HTMLButtonElement | null;
  private _values: Record<string, any> = {};
  private _submitHandler: ((values: D) => void) | null;

  constructor(
    $f: HTMLFormElement,
    submitHandler: ((values: D) => void) | null = null
  ) {
    this._f = $f;
    this._els = Array.from($f.elements).filter(
      ($el) =>
        $el.nodeName.toLocaleLowerCase() !== 'button' &&
        $el.getAttribute('type') !== 'submit'
    ) as FormElement[];
    this._submitHandler = submitHandler;
    if (submitHandler) {
      $f.addEventListener('submit', this._formSubmitHandler);
    }
    this._submitButton = $f.querySelector('[type=submit]');
    if (this._submitButton) {
      this._els.forEach(($input) => {
        $input.addEventListener('input', this._inputChangeHandler);
      });
    }
  }

  private _formSubmitHandler = (ev: SubmitEvent): void => {
    const handler = this._submitHandler;
    const values = this.readForm();
    if (handler && values) {
      ev.preventDefault();
      handler(values);
    }
  };

  private _inputChangeHandler = (ev: Event): void => {
    const vals = this._values;
    const $submit = this._submitButton;
    if ($submit) {
      $submit.disabled = !this._els.some(($i) => $i.value !== vals[$i.name]);
    }
  };

  get submitButton() {
    return this._submitButton;
  }

  setForm(v: D): void {
    const vals = this._values;
    this._els.forEach(($input) => {
      const name = $input.name;
      const value = v[name];
      switch ($input.nodeName.toLowerCase()) {
        case 'input':
          switch ($input.type) {
            case 'number':
              if ($input.dataset.currency) {
                vals[name] = $input.value = Number(value).toFixed(2);
              } else {
                vals[name] = $input.value = value;
              }
              break;
            case 'date':
              vals[name] = $input.value = value.split('T')[0];
              break;
            case 'checkbox':
              (<HTMLInputElement>$input).checked = !!value;
              vals[name] = String(!!value);
              break;
            default:
              vals[name] = $input.value = String(value);
          }
          break;
        case 'textarea':
          vals[name] = $input.innerHTML = value || '';
          break;
        case 'select':
          break;
      }
    });
  }

  readForm(): D | undefined {
    const f = this._f;
    f.classList.add('was-validated');
    if (f.checkValidity()) {
      return Object.fromEntries(new FormData(f)) as D;
    }
    return undefined;
  }

  resetForm(): void {
    const f = this._f;
    f.reset();
    f.classList.remove('was-validated');
    this._values = Object.fromEntries(new FormData(f));
  }

  destroy(): void {
    this.resetForm();
    this._els.forEach(($input) => {
      $input.removeEventListener('input', this._inputChangeHandler);
    });
    this._f.removeEventListener('submit', this._formSubmitHandler);
  }
}
