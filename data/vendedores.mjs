import {
  TABLE_VENDEDORES,
  listAll,
  getById,
  createWithCuid,
  updateById,
  deleteById,
} from './utils.mjs';

export default {
  list: () => listAll(TABLE_VENDEDORES),
  remove: ({ id }) => deleteById(TABLE_VENDEDORES, id),
  get: ({ id }) => getById(TABLE_VENDEDORES, id),
  create: ({ data }) => createWithCuid(TABLE_VENDEDORES, data),
  update: ({ id, data }) => updateById(TABLE_VENDEDORES, id, data),
};
