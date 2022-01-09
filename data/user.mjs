import {
  TABLE_USERS,
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

const safeFields = ['id', 'nombre', 'email'];

export default function ({ op, ...rest }) {
  const fns = {
    list: () => listAll(TABLE_USERS, safeFields),
    remove: ({ id }) => deleteById(TABLE_USERS, id),
    get: ({ id }) => getById(TABLE_USERS, id, safeFields),
    create: ({ data }) =>
      createWithCuid(TABLE_USERS, hashPassword(data), safeFields),
    update: ({ id, data }) =>
      updateById(TABLE_USERS, id, hashPassword(data), safeFields),
    checkValidUser: ({ data }) =>
      getDb().then((db) =>
        db.get(
          `select ${safeFields.join(',')}
           from ${TABLE_USERS} where lower(email) = lower(?) and password = ?`,
          [data.email, hash(data.password.toLowerCase())]
        )
      ),
  };
  const fn = fns[op];
  if (fn) return fn(rest);
  return Promise.reject('not found');
}
