import fs from 'fs/promises';
import path from 'path';

const htmlDir = 'src/html';

const files = [
  // always first
  'navbar',

  // Popups
  'notFound',
  'loading',
  'error',
  'confirma',

  // modules
  'home',
  'login',
  'editVendedor',
  'editVenta',
  'listVendedores',
  'listVentas',
  'showVendedor',
  'showVenta',
];

export default function () {
  Promise.all(
    files.map((f) =>
      fs.readFile(path.join(process.cwd(), 'src/html', `${f}.html`), {
        encoding: 'utf8',
      })
    )
  ).then((contents) => {
    fs.readFile(path.join(process.cwd(), 'src/index.html'), {
      encoding: 'utf8',
    }).then((template) => {
      const parts = template.split('<!-- ### -->');
      return fs.writeFile(
        path.join(process.cwd(), 'public/index.html'),
        parts[0] + contents.join('\n') + parts[1]
      );
    });
  });
}
