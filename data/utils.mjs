import cuid from 'cuid';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import { join } from 'path';

const NOT_FOUND = 404;

let _db;

export function getDb() {
  return _db
    ? Promise.resolve(_db)
    : open({
        filename: join(process.cwd(), 'data', 'db.sqlite'),
        driver: sqlite3.Database,
      }).then((db) => {
        _db = db;
        return db;
      });
}

export function listAll(nombreTabla, camposSalida) {
  return getDb()
    .then((db) =>
      db.all(
        `select ${
          camposSalida ? camposSalida.join(',') : '*'
        } from ${nombreTabla}`
      )
    )
    .then((data) => ({ data }))
    .catch((err) => ({
      error: err.code,
      data: err.message,
    }));
}

export function rawGetById(nombreTabla, id, camposSalida) {
  const f = camposSalida ? camposSalida.join(',') : '*';
  return getDb().then((db) =>
    db.get(`select ${f} from ${nombreTabla} where id = ?`, [id])
  );
}

export function getById(nombreTabla, id, camposSalida) {
  return rawGetById(nombreTabla, id, camposSalida)
    .then((data) => ({ data }))
    .catch((err) => ({
      error: err.code,
      data: err.message,
    }));
}

export function createWithAutoId(
  nombreTabla,
  fila,

  camposSalida
) {
  const { id: _, ...rest } = fila;
  const fields = Object.keys(rest);
  const values = Object.values(rest);
  return getDb().then((db) =>
    db
      .run(
        `insert into ${nombreTabla} (${fields}) values (${Array(fields.length)
          .fill('?')
          .join(',')})`,
        values
      )
      .then((response) => ({
        data: rawGetById(nombreTabla, response.lastID, camposSalida),
      }))

      .catch((err) => ({
        error: err.code,
        data: err.message,
      }))
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
  return getDb().then((db) =>
    db
      .run(
        `insert into ${nombreTabla} (id, ${fields.join(',')}) values (${Array(
          fields.length + 1
        )
          .fill('?')
          .join(',')})`,
        [id, ...values]
      )
      .then((response) =>
        response.changes === 1
          ? {
              data: rawGetById(nombreTabla, id, camposSalida),
            }
          : {
              error: SQLITE_ERROR,
              data: 'no changes',
            }
      )
      .catch((err) => ({
        error: err.code,
        data: err.message,
      }))
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
  return getDb().then((db) =>
    db
      .run(
        `update ${nombreTabla}  set (${fields.join(',')}) = (${Array(
          fields.length
        )
          .fill('?')
          .join(',')})  where id = ?`,
        [...values, id]
      )
      .then((response) =>
        response.changes === 1
          ? {
              data: rawGetById(nombreTabla, id, camposSalida),
            }
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