import {
  listAll,
  getById,
  createWithCuid,
  updateById,
  deleteById,
  getDb,
} from './utils.mjs';
import { createHmac } from 'crypto';

export function hash(data) {
  const hmac = createHmac(
    'sha256',
    process.env.SESSION_PASSWORD || 'alguna tontera'
  );
  hmac.update(data);
  return hmac.digest('hex');
}

const TABLE = 'Users';

const safeFields = ['id', 'nombre', 'email'];

export default function ({ op, ...rest }) {
  const fns = {
    list: () => listAll(TABLE, safeFields),
    del: ({ id }) => deleteById(TABLE, id),
    get: ({ id }) => getById(TABLE, id, safeFields),
    create: ({ data }) => createWithCuid(TABLE, hashPassword(data), safeFields),
    update: ({ id, data }) =>
      updateById(TABLE, id, hashPassword(data), safeFields),
    checkValidUser: ({ data }) =>
      getDb().then((db) =>
        db.get(
          `select ${safeFields.join(',')}
           from ${TABLE} where lower(email) = lower(?) and password = ?`,
          [data.email, hash(data.password.toLowerCase())]
        )
      ),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
