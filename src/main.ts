import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { APP_CONFIG } from './environments/environment';

if (APP_CONFIG.production) {
    enableProdMode();
}

// los tests e2e verifican con esto que el build tomó la configuración del cliente
if (APP_CONFIG.environment === 'E2E') {
    (window as unknown as { __APP_CONFIG__: typeof APP_CONFIG }).__APP_CONFIG__ = APP_CONFIG;
}

platformBrowserDynamic()
    .bootstrapModule(AppModule, {
        preserveWhitespaces: false
    })
    .catch((err) => console.error(err));
