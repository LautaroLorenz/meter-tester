import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as Store from 'electron-store';
const store = new Store();

// Path de la base de datos en el directorio de datos del usuario
const username = os.userInfo().username;
const userDataDir = app?.getPath('userData') ?? calculateUserDataDir();
const dataBaseName = 'database.db';
const defaultDataBasePath = path.join(userDataDir, dataBaseName);

// Esta función se utiliza cunado usamos comandos knex ubicados en el package.json
// se debe a que en ese contexto electron.app es undefined porque estamos fuera de NodeJs
function calculateUserDataDir(): string {
  switch (os.platform()) {
    case 'win32':
      return path.join(
        'C:',
        'Users',
        username,
        'AppData',
        'Roaming',
        'oelec-ce-soft'
      );
    case 'darwin':
      return path.join(
        '/Users',
        username,
        'Library',
        'Application Support',
        'oelec-ce-soft'
      );
    case 'linux':
      return path.join('/home', username, '.config', 'oelec-ce-soft');
    default:
      console.log('Platform not supported');
      break;
  }
  return '';
}

// Obtiene la ruta seleccionada por el usuario desde el almacenamiento local
const userSelectedDir: string | undefined = store.get('dbDirectory') as string;

// Usa la ruta seleccionada por el usuario si existe, de lo contrario usa la predeterminada
export const dataBasePath = userSelectedDir ?? defaultDataBasePath;
