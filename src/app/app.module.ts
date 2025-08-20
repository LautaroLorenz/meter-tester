import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// NG Translate
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { FeaturesModule } from './features/features.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from './components/confirm-dialog/confirm-dialog.module';
import { DialogModule } from 'primeng/dialog';
import { BlockUiModule } from './components/block-ui/block-ui.module';
import { MenuModule } from './components/menu/menu.module';

import { ConfirmationService, MessageService } from 'primeng/api';
import { PipesModule } from './pipes/pipes.module';
import { DirectivesModule } from './directives/directives.module';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
    new TranslateHttpLoader(http, './assets/i18n/', '.json');

// la aplicación no inicializa hasta cargar el idioma default
const appInitializerLangFactory = (translate: TranslateService): any => {
    return () =>
        new Promise<any>((resolve: any) => {
            translate.setDefaultLang('es');
            translate.use('es').subscribe(() => resolve(null) as unknown);
        });
};

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        FeaturesModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        BlockUiModule,
        MenuModule,
        PipesModule,
        DirectivesModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerLangFactory,
            deps: [TranslateService],
            multi: true
        },
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        },
        ConfirmationService,
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
