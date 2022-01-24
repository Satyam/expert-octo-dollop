import jwt from 'jsonwebtoken';
import { checkValidUser } from './user.mjs';

const UNAUTHORIZED = 401;

const checkSession = (req) =>
  new Promise((resolve, reject) => {
    const token = req.cookies[process.env.SESSION_COOKIE];
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, { iat, exp, ...user }) => {
          if (err) reject(UNAUTHORIZED);
          else {
            resolve(user);
          }
        }
      );
    } else reject(UNAUTHORIZED);
  });

const setSessionCookie = (res, user) =>
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

export const authMiddleware = (req, res, next) => {
  checkSession(req)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      res.json({
        error,
        data: 'Unauthorized',
      });
    });
};

export default {
  login: ({ data }, req, res) =>
    checkValidUser(data.email, data.password).then((user) => {
      setSessionCookie(res, user);
      return { data: user };
    }),
  logout: (_, req, res) => {
    res.clearCookie(process.env.SESSION_COOKIE);
    return Promise.resolve({ data: {} });
  },
  isLoggedIn: (_, req, res) =>
    checkSession(req)
      .then((user) => {
        setSessionCookie(res, user);
        return { data: user };
      })
      .catch((error) => {
        return {
          data: null,
        };
      }),
};
