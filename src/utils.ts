import { getAllByClass } from './gets';

export const setTitle = (title?: string) =>
  (document.title = title ? `La Corazón - ${title}` : 'La Corazón');

export const show = ($: HTMLElement) => {
  $.style.display = 'block';
};
export const hide = ($: HTMLElement) => {
  $.style.display = 'none';
};

const currency = 'EUR';
const locale = 'es-ES';

const dateFormatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium',
});

export const formatDate = (date: Date | string) =>
  date instanceof Date
    ? dateFormatter.format(date)
    : date
    ? dateFormatter.format(new Date(date))
    : '';

const currFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
});

export const formatCurrency = (value?: number) =>
  typeof value === 'undefined' ? '' : currFormatter.format(value);
/**
 *
 * @param $row {HTMLTableRowElement} Table row to be filled up
 * @param data Record containing the data for the row
 * @param formatters Optional formatter. See below.
 *
 * `fillRow` identifies the fields to be filled in by the `field`
 * class name.  Those fields should have the `data-field` attribute
 * set to the name of the field in `data` that they should display.
 *
 * ```html
 * <td class="text-end field" data-field="precioUnitario"></td>
 * ```
 *
 * If `formatter` is missing, all fields will be filled in with
 * the value of the named field, converted to string, or a blank.
 *
 * Otherwise `formatter` is an object where its property names
 * are the names of the fields to process.  If a field is not present
 * in the formatter, it will simply filled in with the value.
 *
 * Fields named in the `formatter` object can have either one of
 * `currency`, `date` or `boolean` which will apply those conversions to the
 * field value.
 *
 * Formatters can be more generic by providing a function which will receive
 * a reference to the `HTMLElement` to be filled in and the `data`.
 * The function should not return anything and may freely manipulate the HTMLElement.
 */
export const fillRow = <D extends Record<string, any>>(
  $row: HTMLTableRowElement,
  data: D,
  formatters: Record<
    string,
    (($el: HTMLElement, v: D) => void) | 'currency' | 'date' | 'boolean'
  > = {}
) => {
  $row.dataset.id = String(data.id);
  getAllByClass<HTMLElement>($row, 'field').forEach(($el) => {
    const field = $el.dataset.field || '';
    const formatter = formatters[field];
    const value = data[field];
    switch (typeof formatter) {
      case 'string':
        switch (formatter) {
          case 'currency':
            $el.textContent = formatCurrency(value);
            break;
          case 'date':
            $el.textContent = formatDate(value);
            break;
          case 'boolean':
            $el.classList.add(value ? 'bi-check-square' : 'bi-square', 'bi');
            break;
        }

        break;
      case 'function':
        formatter($el, data);
        break;
      default:
        $el.textContent = String(value || '');
        break;
    }
  });
};

export const router = {
  push: (path: string, refresh?: boolean) => {
    history.pushState({ path }, '', path);
    window.dispatchEvent(
      new CustomEvent('router', {
        detail: { path, refresh, method: 'push' },
      })
    );
  },
  replace: (path: string, refresh?: boolean) => {
    history.replaceState({ path }, '', path);
    window.dispatchEvent(
      new CustomEvent('router', {
        detail: { path, refresh, method: 'replace' },
      })
    );
  },
};

export const setCheckboxIcon = ($el: HTMLElement, value: boolean) => {
  $el.classList.add(value ? 'bi-check-square' : 'bi-square', 'bi');
};
