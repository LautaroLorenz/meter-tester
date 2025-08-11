import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, filter, take, timer, switchMap } from 'rxjs';
import { PageUrlName } from './models/business/enums/page-name.model';
import { Title } from '@angular/platform-browser';
import { BlockUIService } from './services/block-ui.service';
import { IpcService } from './services/ipc.service';
import { MessagesService } from './services/messages.service';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    isVirtualMachinePage = false;
    isCommandHistoryPage = false;
    isSecondaryWindow = false;
    conecctionLogsDialogOpened = false;
    connectionLogs: any;
    ports: any;

    constructor(
        private readonly router: Router,
        private readonly titleService: Title,
        private readonly blockUIService: BlockUIService,
        private readonly ipcService: IpcService,
        private readonly messagesService: MessagesService,
        private readonly primeNgConfig: PrimeNGConfig
    ) {}

    get blocked$(): Observable<boolean> {
        return this.blockUIService.blocked$;
    }

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe((event) => {
                this.isVirtualMachinePage = (event as NavigationEnd).url === `/${PageUrlName.virtualMachine}`;
                this.isCommandHistoryPage = (event as NavigationEnd).url === `/${PageUrlName.commandHistory}`;
                this.isSecondaryWindow = (event as NavigationEnd).urlAfterRedirects.includes('secondary-window');
                if (this.isVirtualMachinePage) {
                    this.titleService.setTitle('Máquina virtual');
                }
                if (this.isCommandHistoryPage) {
                    this.titleService.setTitle('Historial de comandos');
                }
            });

        timer(3000)
            .pipe(
                take(1),
                switchMap(() => this.ipcService.invoke$('get-database-connection-status'))
            )
            .subscribe(({ status, created, updated, updatedError, location }) => {
                if (!status) {
                    this.messagesService.error('Error de conexión a la base de datos');
                }
                if (created) {
                    this.messagesService.info('Base de datos creada', true);
                }
                if (updated) {
                    this.messagesService.info('Base de datos actualizada', true);
                }
                if (updatedError) {
                    this.messagesService.error('Error actualizando base de datos');
                }
                if (location) {
                    // console.log(location);
                }
            });

        timer(3000)
            .pipe(
                take(1),
                switchMap(() => this.ipcService.invoke$('check-connection-logs'))
            )
            .subscribe(({ connectionLogs, ports }) => {
                if (connectionLogs) {
                    this.connectionLogs = connectionLogs;
                    if (ports) {
                        this.ports = ports;
                    }
                    this.conecctionLogsDialogOpened = true;
                }
            });

        this.primeNgConfig.setTranslation({
            startsWith: 'Comienza con',
            contains: 'Contiene',
            notContains: 'No contiene',
            endsWith: 'Termina con',
            equals: 'Igual',
            notEquals: 'No igual',
            noFilter: 'Sin filtro',
            lt: 'Menor que',
            lte: 'Menor o igual que',
            gt: 'Mayor que',
            gte: 'Mayor o igual que',
            is: 'Es',
            isNot: 'No es',
            before: 'Antes',
            after: 'Después',
            clear: 'Limpiar',
            apply: 'Aplicar',
            matchAll: 'Coincidir todo',
            matchAny: 'Coincidir cualquier',
            addRule: 'Agregar regla',
            removeRule: 'Eliminar regla',
            accept: 'Sí',
            reject: 'No',
            choose: 'Elegir',
            upload: 'Subir',
            cancel: 'Cancelar',
            dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            monthNames: [
                'Enero',
                'Febrero',
                'Marzo',
                'Abril',
                'Mayo',
                'Junio',
                'Julio',
                'Agosto',
                'Septiembre',
                'Octubre',
                'Noviembre',
                'Diciembre'
            ],
            monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            today: 'Hoy',
            weekHeader: 'Semana',
            dateFormat: 'dd/mm/yy'
        });
    }
}
