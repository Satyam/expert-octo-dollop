const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.post('/api', express.json(), (req, res) => {});

app.use(
  '/bootstrap',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist'))
);

app.use(
  '/icons',
  express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font'))
);

app.use(express.static('public'));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`La Corazón app started at http://localhost:${port}`);
});
