import jwt from 'jsonwebtoken';
import { checkValidUser } from './user.mjs';

const UNAUTHORIZED = 401;

export const authMiddleware = (req, res, next) => {
  if (req.path === '/api/auth' && req.body.op === 'login') return void next();
  const token = req.cookies[process.env.SESSION_COOKIE];
  const unauthorised = () =>
    res.json({
      error: UNAUTHORIZED,
      data: 'Unauthorized',
    });

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) unauthorised();
      else {
        req.user = user;
        next();
      }
    });
  } else unauthorised();
};

const fns = {
  login: ({ data }, res) => {
    return checkValidUser(data.email, data.password).then((user) => {
      res.cookie(
        process.env.SESSION_COOKIE,
        jwt.sign(user, process.env.JWT_SECRET, {
          expiresIn: `${process.env.SESSION_DURATION}s`,
        }),
        {
          httpOnly: true,
          expires: new Date(Date.now() + process.env.SESSION_DURATION * 1000),
        }
      );
      return { data: user };
    });
  },
  logout: (_, res) => {
    res.clearCookie(process.env.SESSION_COOKIE);
    return Promise.resolve({ data: {} });
  },
};

export default function ({ op, ...rest }, res) {
  const fn = fns[op];
  if (fn) return fn(rest, res);
  return Promise.reject('not found');
}
