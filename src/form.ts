import apiService from 'apiService';
import {
  cloneTemplate,
  getAllByTag,
  getById,
  getFirstByTag,
  getTarget,
} from 'gets';

enum FieldTypes {
  plainValue,
  number,
  currency,
  checkbox,
  date,
  multiSelect,
  multiCheck,
}

type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLButtonElement;

export default class Form<D extends Record<string, any>> {
  private _f: HTMLFormElement;
  private _fieldTypes: Record<string, FieldTypes>;
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
    const els = Array.from($f.elements).filter(
      ($el) => ($el as FormElement).name
    ) as FormElement[];

    this._fieldTypes = els.reduce((types, $el) => {
      const name = $el.name;
      let type: FieldTypes = FieldTypes.plainValue;
      switch ($el.tagName) {
        case 'INPUT':
          switch ($el.type) {
            case 'number':
              type = $el.dataset.currency
                ? FieldTypes.currency
                : FieldTypes.number;
              break;
            case 'date':
              type = FieldTypes.date;
              break;
            case 'checkbox':
              const $item = this._f.elements.namedItem(name);
              type =
                $item instanceof RadioNodeList && $item.length > 1
                  ? FieldTypes.multiCheck
                  : FieldTypes.checkbox;

              break;
          }
          break;
        case 'SELECT':
          type = ($el as HTMLSelectElement).multiple
            ? FieldTypes.multiSelect
            : FieldTypes.plainValue;
          break;
      }
      return { ...types, [name]: type };
    }, {});

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

  get fieldNames() {
    return Object.keys(this._fieldTypes);
  }

  watchFields(fields: string[], fn: (name?: string) => void): void {
    this._watchedFields = fields;
    this._watchListener = fn;
  }

  getFieldByName(name: string): FormElement | undefined {
    return this._f[name];
  }

  setForm(v: D): void {
    for (const name in v) {
      const value: any = v[name];
      const $el = this._f[name];
      switch (this._fieldTypes[name]) {
        case FieldTypes.checkbox:
          $el.checked = !!value;
          break;
        case FieldTypes.currency:
          $el.value = Number(value).toFixed(2);
          break;
        case FieldTypes.checkbox:
          break;
        case FieldTypes.date:
          $el.value = (
            value instanceof Date ? value.toISOString() : value
          ).split('T')[0];
          break;
        case FieldTypes.multiCheck:
          const $item = this._f.elements.namedItem(name);
          if ($item instanceof RadioNodeList) {
            $item.forEach(($o) => {
              ($o as HTMLInputElement).checked = value.includes(
                ($o as HTMLInputElement).value
              );
            });
          }

          break;
        case FieldTypes.multiSelect:
          Array.from(($el as HTMLSelectElement).options).forEach(($o) => {
            $o.selected = $o.value === value;
          });
          break;
        case FieldTypes.number:
          $el.value = String(value);
          break;
        case FieldTypes.plainValue:
          $el.value = value;
          break;
      }
    }

    this._sendWatch();
  }

  getFieldValue(name: string): any {
    const $el = this._f[name];
    if ($el) {
      switch (this._fieldTypes[name]) {
        case FieldTypes.plainValue:
          return $el.value;
        case FieldTypes.checkbox:
          return $el.checked;
        case FieldTypes.date:
          return new Date($el.value);
        case FieldTypes.currency:
        // Just a number:
        case FieldTypes.number:
          return parseFloat($el.value);
        case FieldTypes.multiCheck: {
          const $item = this._f.elements.namedItem(name);
          if ($item instanceof RadioNodeList) {
            return Array.from($item)
              .filter(($i) => ($i as HTMLInputElement).checked)
              .map(($i) => ($i as HTMLInputElement).value);
          }
        }
        case FieldTypes.multiSelect:
          return (Array.from($el.selectedOptions) as HTMLOptionElement[]).map(
            ($o) => $o.value
          );
        default:
          return $el.value;
      }
    }
  }

  readForm(): D | undefined {
    const f = this._f;
    f.classList.add('was-validated');
    if (f.checkValidity()) {
      return Object.keys(this._fieldTypes).reduce<D>(
        (vals, name) => ({
          ...vals,
          [name]: this.getFieldValue(name),
        }),
        {} as D
      );
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
