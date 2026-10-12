import { test, expect } from './support/fixtures';
import { openMenu } from './support/menu';

const PANTALLAS = [
  { menu: ['menu-ensayos', 'menu-ensayos-administracion'], url: 'ensayos-disponibles', titulo: 'Administración de Ensayos' },
  { menu: ['menu-ensayos', 'menu-ensayos-historial'], url: 'historial', titulo: 'Historial de ejecución' },
  { menu: ['menu-medidores', 'menu-medidores-modelos'], url: 'medidores', titulo: 'Modelos de Medidores' },
  { menu: ['menu-medidores', 'menu-medidores-marcas'], url: 'marcas', titulo: 'Marcas de Medidores' },
  { menu: ['menu-backup', 'menu-backup-crear'], url: 'crear-backup', titulo: 'Crear backup' },
  { menu: ['menu-backup', 'menu-backup-restaurar'], url: 'restaurar-backup', titulo: 'Restaurar base de datos' },
];

const DIALOGOS = [
  { menu: ['menu-configuracion', 'menu-configuracion-base-de-datos'], titulo: 'Base de datos' },
  { menu: ['menu-configuracion', 'menu-configuracion-acerca-de'], titulo: 'Información del sistema' },
];

test('recorre todas las pantallas y dialogos del menu', async ({ launched }) => {
  const { mainWindow } = launched;

  for (const pantalla of PANTALLAS) {
    await test.step(pantalla.titulo, async () => {
      await openMenu(mainWindow, pantalla.menu);

      await expect(mainWindow).toHaveURL(new RegExp(`#/${pantalla.url}$`));
      await expect(mainWindow.locator('app-page-title')).toContainText(pantalla.titulo);
      await test.info().attach(pantalla.titulo, { body: await mainWindow.screenshot(), contentType: 'image/png' });
    });
  }

  for (const dialogo of DIALOGOS) {
    await test.step(dialogo.titulo, async () => {
      await openMenu(mainWindow, dialogo.menu);

      // PrimeNG 16 no le da nombre accesible al p-dialog: se busca por el texto del header
      const dialog = mainWindow.getByRole('dialog').filter({ hasText: dialogo.titulo });
      await expect(dialog).toBeVisible();
      await test.info().attach(dialogo.titulo, { body: await mainWindow.screenshot(), contentType: 'image/png' });
      await mainWindow.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });
  }
});
