import apiService from 'apiService';
import { cloneTemplate, getAllByTag, getById, getFirstByTag } from 'gets';

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
              vals[name] = $input.value = (
                value instanceof Date ? value.toISOString() : value
              ).split('T')[0];
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
          Array.from(($input as HTMLSelectElement).options).forEach(($o) => {
            $o.selected = $o.value === value;
          });
          break;
      }
    });
  }

  readForm(): D | undefined {
    const f = this._f;
    f.classList.add('was-validated');
    if (f.checkValidity()) {
      return this._els.reduce<D>((vals, $el) => {
        const name = $el.name;
        let v: any;
        switch ($el.nodeName.toLocaleLowerCase()) {
          case 'input':
            switch ($el.type) {
              case 'date':
                v = new Date($el.value);
                break;
              case 'checkbox':
                v = ($el as HTMLInputElement).checked;
                break;
              default:
                v = $el.value;
                break;
            }
            break;
          case 'select':
            v = $el.value;
            break;
          default:
            v = $el.value;
            break;
        }

        return {
          ...vals,
          [name]: v,
        };
      }, {} as D);
    }
    return undefined;
  }

  resetForm(): void {
    const f = this._f;
    f.reset();
    f.classList.remove('was-validated');
    this._values = Object.fromEntries(new FormData(f));
    getAllByTag<HTMLSelectElement>(f, 'select')?.forEach(($s) => {
      if ($s.length === 0) {
        switch ($s.dataset.options) {
          case 'optionsVendedores':
            populateVendedores($s);
            break;
        }
      }
    });
  }

  destroy(): void {
    this.resetForm();
    this._els.forEach(($input) => {
      $input.removeEventListener('input', this._inputChangeHandler);
    });
    this._f.removeEventListener('submit', this._formSubmitHandler);
  }
}

const compareIgnoreCase =
  (prop: string) =>
  (a: Record<string, any>, b: Record<string, any>): number => {
    const propA = a[prop].toUpperCase(); // ignore upper and lowercase
    const propB = b[prop].toUpperCase(); // ignore upper and lowercase
    if (propA < propB) return -1;
    if (propA > propB) return 1;
    return 0;
  };

const populateVendedores = ($sel: HTMLSelectElement): Promise<void> =>
  apiService<Vendedor[]>('vendedores', {
    op: 'list',
  }).then((vs) => {
    const o = document.createElement('option');
    o.textContent = '---';
    o.value = '';
    $sel.add(o);
    vs.sort(compareIgnoreCase('nombre')).forEach((v) => {
      const o = document.createElement('option');
      o.value = String(v.id);
      o.textContent = v.nombre;
      $sel.add(o);
    });
  });
