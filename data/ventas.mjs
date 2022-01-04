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
      getDb().then((db) =>
        options.idVendedor
          ? db.all(
              `select * from ${TABLE} where idVendedor = $idVendedor order by fecha, id`,
              {
                $idVendedor: options.idVendedor,
              }
            )
          : db.all(
              `select Ventas.*, Users.nombre as vendedor from Ventas 
          inner join Users on Ventas.idVendedor = Users.id  
          order by fecha, id`
            )
      ),
    del: ({ id }) => deleteById(TABLE, id),
    get: ({ id }) => getById(TABLE, id),
    create: ({ data }) => createWithCuid(TABLE, data),
    update: ({ id, data }) => updateById(TABLE, id, data),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
