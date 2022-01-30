import { getById } from '../gets';
import { showAndHideHandler } from '../popups/popups';

export const homr = showAndHideHandler(getById('loading'));
