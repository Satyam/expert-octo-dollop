const listVendedoresHandler: Module<void> = ($listVendedores) => {
  const $tableVendedores = getById('tableVendedores');
  const $tbodyVendedores = getFirstByTag<HTMLTableSectionElement>(
    $tableVendedores,
    'tbody'
  );
  const $tplVendedores = getById('tplVendedores') as HTMLTemplateElement;

  $tableVendedores.onclick = (ev) => {
    ev.preventDefault();
    const $t = getTarget(ev);
    const action = getClosest($t, '.action')?.dataset.action;
    if (action) {
      const id = getClosest($t, 'tr').dataset.id;
      switch (action) {
        case 'add':
          router.push('/vendedor/new');
          break;
        case 'show':
          router.push(`/vendedor/${id}`);
          break;
        case 'edit':
          router.push(`/vendedor/edit/${id}`);
          break;
        case 'delete':
          confirmar
            .ask('¿Quiere borrar este vendedor?', undefined, true)
            .then((confirma) => {
              return (
                confirma &&
                apiService('vendedores', {
                  op: 'remove',
                  id,
                })
              );
            })
            .then(() => {
              router.replace(`/vendedores`, true);
            });
          break;
      }
    }
  };

  const render = () => {
    setTitle('Vendedores');
    show($listVendedores);
    apiService<{}, Vendedor[]>('vendedores', {
      op: 'list',
    }).then((vendedores) => {
      const $$tr = getAllByTag<HTMLTableRowElement>($tbodyVendedores, 'tr');
      $$tr.forEach(($row, index) => {
        if (index >= vendedores.length) {
          $row.classList.add('hidden');
        } else {
          $row.classList.remove('hidden');
          fillRow($row, vendedores[index]);
        }
      });

      vendedores.slice($$tr.length).forEach((v) => {
        const $row = cloneTemplate<HTMLTableRowElement>($tplVendedores);
        fillRow($row, v);
        $tbodyVendedores.append($row);
      });
    });
  };
  return {
    render,
    close: () => hide($listVendedores),
  };
};
