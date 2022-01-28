export const getById = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

export const getFirstByClass = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): T => $.getElementsByClassName(name)[0] as T;

export const getAllByClass = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): Array<T> => Array.from($.getElementsByClassName(name)) as T[];

export const getFirstByTag = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): T => $.getElementsByTagName(name)[0] as T;

export const getAllByTag = <T extends HTMLElement>(
  $: Element | Document,
  name: string
): Array<T> => Array.from($.getElementsByTagName(name)) as T[];

export const getClosest = <T extends HTMLElement>(
  $: Element,
  selector: string
): T => $.closest(selector) as T;

export const getTarget = <T extends HTMLElement>(ev: Event): T =>
  ev.target as T;

export const cloneTemplate = <T extends HTMLElement>(
  $tpl: HTMLTemplateElement
) => ($tpl.content.cloneNode(true) as HTMLElement).firstElementChild as T;
