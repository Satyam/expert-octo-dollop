import express from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import auth, { authMiddleware } from './data/auth.mjs';
import vendedores from './data/vendedores.mjs';
import ventas from './data/ventas.mjs';
import users from './data/user.mjs';
import dotEnv from 'dotenv';

const app = express();
const port = 3000;

dotEnv.config();

app.use(cookieParser());

app.post('/api/*', express.json(), authMiddleware, (req, res) => {
  let response;
  switch (req.path.replace('/api/', '')) {
    case 'auth':
      response = auth(req.body, res);
      break;
    case 'vendedores':
      response = vendedores(req.body);
      break;
    case 'ventas':
      response = ventas(req.body);
      break;
    case 'users':
      response = users(req.body);
      break;
    case 'verify':
      res.send('ok');
      return;
    default:
      res.status(404).send(`Not found ${req.path}`);
      return;
  }
  response
    .then((resp) => res.json(resp))
    .catch((err) => {
      console.error(err);
      res.status(400).send(`In "${req.path}", invalid op "${req.body.op}"`);
    });
});

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
