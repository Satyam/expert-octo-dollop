import cuid from 'cuid';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import { join } from 'path';

export const TABLE_VENTAS = 'Ventas';
export const TABLE_VENDEDORES = 'Vendedores';
export const TABLE_DISTRIBUIDORES = 'Distribuidores';
export const TABLE_SALIDAS = 'Salidas';
export const TABLE_USERS = 'Users';
export const TABLE_CONSIGNA = 'Consigna';

const NOT_FOUND = 404;

let _db;

export function formatReply(q) {
  return q
    .then((data) => ({ data }))
    .catch((err) => ({
      error: err.code,
      data: err.message,
    }));
}

export function getDb() {
  return _db
    ? Promise.resolve(_db)
    : open({
        filename: join(process.cwd(), 'data', 'db.sqlite'),
        driver: sqlite3.Database,
      }).then((db) => {
        _db = db;
        // un-comment the following to show statements
        // db.on('trace', (data) => {
        //   console.log(JSON.stringify(data, null, 2));
        // });
        return db;
      });
}

export function listAll(nombreTabla, camposSalida) {
  return formatReply(
    getDb().then((db) =>
      db.all(
        `select ${
          camposSalida ? camposSalida.join(',') : '*'
        } from ${nombreTabla}`
      )
    )
  );
}

export function rawGetById(nombreTabla, id, camposSalida) {
  const f = camposSalida ? camposSalida.join(',') : '*';
  return getDb().then((db) =>
    db.get(`select ${f} from ${nombreTabla} where id = ?`, [id])
  );
}

export function getById(nombreTabla, id, camposSalida) {
  return rawGetById(nombreTabla, id, camposSalida)
    .then((data) => {
      if (data) return { data };
      return Promise.reject({ code: 404, message: 'Not found' });
    })
    .catch((err) => ({
      error: err.code,
      data: err.message,
    }));
}

const replyOneChange = (nombreTabla, id, camposSalida, query) =>
  formatReply(
    getDb()
      .then(query)
      .then((response) =>
        response.changes === 1
          ? rawGetById(nombreTabla, id ?? response.lastID, camposSalida)
          : Promise.reject({
              code: SQLITE_ERROR,
              message: 'No changes made',
            })
      )
  );

export function createWithAutoId(
  nombreTabla,
  fila,

  camposSalida
) {
  const { id: _, ...rest } = fila;
  const fields = Object.keys(rest);
  const values = Object.values(rest);
  return replyOneChange(nombreTabla, null, camposSalida, (db) =>
    db.run(
      `insert into ${nombreTabla} (${fields}) values (${Array(fields.length)
        .fill('?')
        .join(',')})`,
      values
    )
  );
}

export function createWithCuid(
  nombreTabla,
  fila,

  camposSalida
) {
  const id = cuid();
  const { id: _, ...rest } = fila;
  const fields = Object.keys(rest);
  const values = Object.values(rest);
  return replyOneChange(nombreTabla, id, camposSalida, (db) =>
    db.run(
      `insert into ${nombreTabla} (id, ${fields.join(',')}) values (${Array(
        fields.length + 1
      )
        .fill('?')
        .join(',')})`,
      [id, ...values]
    )
  );
}

export function updateById(
  nombreTabla,
  id,
  fila,

  camposSalida
) {
  const fields = Object.keys(fila);
  const values = Object.values(fila);
  return replyOneChange(nombreTabla, id, camposSalida, (db) =>
    db.run(
      `update ${nombreTabla}  set (${fields.join(',')}) = (${Array(
        fields.length
      )
        .fill('?')
        .join(',')})  where id = ?`,
      [...values, id]
    )
  );
}

export function deleteById(nombreTabla, id) {
  return getDb().then((db) =>
    db
      .run(`delete from ${nombreTabla} where id = ?`, [id])
      .then((response) =>
        response.changes === 1
          ? {}
          : {
              error: NOT_FOUND,
              data: 'not found',
            }
      )
      .catch((err) => ({
        error: err.code,
        data: err.message,
      }))
  );
}
