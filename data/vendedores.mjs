import {
  TABLE_VENDEDORES,
  listAll,
  getById,
  createWithCuid,
  updateById,
  deleteById,
} from './utils.mjs';

export default function ({ op, ...rest }) {
  const fns = {
    list: () => listAll(TABLE_VENDEDORES),
    remove: ({ id }) => deleteById(TABLE_VENDEDORES, id),
    get: ({ id }) => getById(TABLE_VENDEDORES, id),
    create: ({ data }) => createWithCuid(TABLE_VENDEDORES, data),
    update: ({ id, data }) => updateById(TABLE_VENDEDORES, id, data),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
