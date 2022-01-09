import {
  getDb,
  getById,
  createWithCuid,
  updateById,
  deleteById,
} from './utils.mjs';

const TABLE = 'Ventas';

export default function ({ op, ...rest }) {
  const fns = {
    list: ({ options }) =>
      getDb()
        .then((db) =>
          options?.idVendedor
            ? db.all(
                `select * from ${TABLE} where idVendedor = $idVendedor order by fecha, id`,
                {
                  $idVendedor: options.idVendedor,
                }
              )
            : db.all(
                `select Ventas.*, Vendedores.nombre as vendedor from Ventas
            inner join Vendedores on Ventas.idVendedor = Vendedores.id  
            order by fecha, id`
              )
        )
        .then((data) => ({ data }))
        .catch((err) => ({
          error: err.code,
          data: err.message,
        })),
    remove: ({ id }) => deleteById(TABLE, id),
    get: ({ id }) => getById(TABLE, id),
    create: ({ data }) => createWithCuid(TABLE, data),
    update: ({ id, data }) => updateById(TABLE, id, data),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
