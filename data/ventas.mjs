import {
  TABLE_VENTAS,
  TABLE_VENDEDORES,
  getDb,
  getById,
  createWithCuid,
  updateById,
  deleteById,
} from './utils.mjs';

const fns = {
  list: ({ options }) =>
    getDb()
      .then((db) =>
        options?.idVendedor
          ? db.all(
              `select * from ${TABLE_VENTAS} where idVendedor = $idVendedor order by fecha, id`,
              {
                $idVendedor: options.idVendedor,
              }
            )
          : db.all(
              `select ${TABLE_VENTAS}.*, ${TABLE_VENDEDORES}.nombre as vendedor from ${TABLE_VENTAS}
              inner join ${TABLE_VENDEDORES} on ${TABLE_VENTAS}.idVendedor = ${TABLE_VENDEDORES}.id  
              order by fecha, id`
            )
      )
      .then((data) => ({ data }))
      .catch((err) => ({
        error: err.code,
        data: err.message,
      })),
  remove: ({ id }) => deleteById(TABLE_VENTAS, id),
  get: ({ id }) => getById(TABLE_VENTAS, id),
  create: ({ data }) => createWithCuid(TABLE_VENTAS, data),
  update: ({ id, data }) => updateById(TABLE_VENTAS, id, data),
};

export default function ({ op, ...rest }) {
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
