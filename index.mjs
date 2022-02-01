import express from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import auth, { authMiddleware } from './data/auth.mjs';
import vendedores from './data/vendedores.mjs';
import ventas from './data/ventas.mjs';
import users from './data/user.mjs';
import dotEnv from 'dotenv';
import buildHtml from './src/html/buildHtml.mjs';

buildHtml();
const app = express();
const port = 3000;

dotEnv.config();

app.use(cookieParser());

const INVALID_OP = 400;

const postHandler = (fns) => (req, res) => {
  const { op, ...rest } = req.body;
  const fn = fns[op];
  if (fn) fn(rest, req, res).then((resp) => res.json(resp));
  else
    res.status(INVALID_OP).json({
      error: INVALID_OP,
      data: `In "${req.path}", invalid op "${op}"`,
    });
};

app.post('/api/auth', express.json(), postHandler(auth));
app.post(
  '/api/vendedores',
  express.json(),
  authMiddleware,
  postHandler(vendedores)
);
app.post('/api/ventas', express.json(), authMiddleware, postHandler(ventas));
app.post('/api/users', express.json(), authMiddleware, postHandler(users));

app.use(
  '/bootstrap',
  express.static(join(process.cwd(), 'node_modules/bootstrap/dist'))
);

app.use(
  '/icons',
  express.static(join(process.cwd(), 'node_modules/bootstrap-icons/font'))
);

app.use(express.static('public'));

app.get('*', (_, res) => {
  res.sendFile(join(process.cwd(), 'public/index.html'));
});

app.listen(port, () => {
  console.log(`La Corazón app started at http://localhost:${port}`);
});
