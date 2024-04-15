import { app } from 'electron';
import * as path from 'path';
import * as os from 'os';

// Path de la base de datos en el directorio de datos del usuario
const username = os.userInfo().username;
const userDataDir = app?.getPath('userData') ?? calculateUserDataDir();
const dataBaseName = 'database.db';

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
        'meter-tester'
      );
    case 'darwin':
      return path.join(
        '/Users',
        username,
        'Library',
        'Application Support',
        'meter-tester'
      );
    case 'linux':
      return path.join('/home', username, '.config', 'meter-tester');
    default:
      console.log('Platform not supported');
      break;
  }
  return '';
}

export const dataBasePath = path.join(userDataDir, dataBaseName);
