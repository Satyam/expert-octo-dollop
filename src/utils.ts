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

export const formatDate = (date: Date) =>
  date ? dateFormatter.format(date) : '';

const currFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
});

export const formatCurrency = (value: number) =>
  value ? currFormatter.format(value) : '';

export const fillRow = <D extends Record<string, any>>(
  $row: HTMLTableRowElement,
  data: D,
  fn?: (fieldName: string, $el: HTMLElement, v: D) => boolean
) => {
  $row.dataset.id = String(data.id);
  getAllByClass($row, 'field').forEach(($el) => {
    const field = $el.dataset.field;
    if (field) {
      if (fn) if (fn(field, $el, data)) return;
      $el.textContent = data[field] || '';
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
