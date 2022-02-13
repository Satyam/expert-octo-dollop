import apiService from 'apiService';
import {
  cloneTemplate,
  getAllByTag,
  getById,
  getFirstByTag,
  getTarget,
} from 'gets';

type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLButtonElement;

export default class Form<D extends Record<string, any>> {
  private _f: HTMLFormElement;
  private _els: FormElement[];
  private _submitButton: HTMLButtonElement | null;
  private _formData: string = '';
  private _submitHandler: ((values: D) => void) | null;
  private _watchedFields: string[] = [];
  private _watchListener: ((name?: string) => void) | undefined;

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
      $f.addEventListener('input', this._inputChangeHandler);
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
    const $submit = this._submitButton;
    if ($submit) {
      $submit.disabled =
        this._formData ===
        // @ts-ignore
        new URLSearchParams(new FormData(this._f)).toString();
    }
    this._sendWatch(getTarget<FormElement>(ev).name);
  };

  private _sendWatch(name?: string): void {
    if (this._watchListener) {
      if (name) {
        if (this._watchedFields.includes(name)) {
          this._watchListener(name);
        }
      } else {
        this._watchListener();
      }
    }
  }
  get submitButton() {
    return this._submitButton;
  }

  get elements() {
    return this._els;
  }

  watchFields(fields: string[], fn: (name?: string) => void): void {
    this._watchedFields = fields;
    this._watchListener = fn;
  }

  getFieldByName(name: string): FormElement | undefined {
    return this._f[name];
  }

  setForm(v: D): void {
    const vals: Record<string, any> = {};
    this._els.forEach(($input) => {
      const name = $input.name;
      const value = v[name];
      if (typeof value === 'undefined') return;
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
    this._sendWatch();
  }

  private _getElValue($el: FormElement): any {
    if ($el) {
      switch ($el.nodeName.toLocaleLowerCase()) {
        case 'input':
          switch ($el.type) {
            case 'date':
              return new Date($el.value);
            case 'checkbox':
              return ($el as HTMLInputElement).checked;
            case 'number':
              return parseFloat($el.value);
            default:
              return $el.value;
          }
        case 'select':
          return $el.value;
        default:
          return $el.value;
      }
    } else return undefined;
  }

  getFieldValue(name: string): any {
    return this._getElValue(this._f[name]);
  }

  readForm(): D | undefined {
    const f = this._f;
    f.classList.add('was-validated');
    if (f.checkValidity()) {
      return this._els.reduce<D>((vals, $el) => {
        const name = $el.name;
        return {
          ...vals,
          [name]: this._getElValue($el),
        };
      }, {} as D);
    }
    return undefined;
  }

  resetForm(): void {
    const f = this._f;
    f.reset();
    f.classList.remove('was-validated');
    Promise.all(
      getAllByTag<HTMLSelectElement>(f, 'select')?.map(($s) => {
        if ($s.length === 0) {
          switch ($s.dataset.options) {
            case 'optionsVendedores':
              return populateVendedores($s);
              break;
          }
        }
      })
    ).then(() => {
      // @ts-ignore
      this._formData = new URLSearchParams(new FormData(this._f)).toString();
    });
    this._sendWatch();
  }

  destroy(): void {
    this.resetForm();
    this._f.removeEventListener('input', this._inputChangeHandler);
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
    $sel.selectedIndex = 0;
  });
