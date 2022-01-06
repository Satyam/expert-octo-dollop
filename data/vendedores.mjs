import {
  listAll,
  getById,
  createWithCuid,
  updateById,
  deleteById,
} from './utils.mjs';

const TABLE = 'Vendedores';

export default function ({ op, ...rest }) {
  const fns = {
    list: () => listAll(TABLE),
    remove: ({ id }) => deleteById(TABLE, id),
    get: ({ id }) => getById(TABLE, id),
    create: ({ data }) => createWithCuid(TABLE, data),
    update: ({ id, data }) => updateById(TABLE, id, data),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
