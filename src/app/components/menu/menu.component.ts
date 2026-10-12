import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PageUrlName } from '../../models/business/enums/page-name.model';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
    PageUrlName = PageUrlName;
    items: MenuItem[] = [];
    settingsItems: MenuItem[] = [];
    displayDataBaseDialog = false;
    displaySystemInfoDialog = false;

    ngOnInit(): void {
        this.items = [
            {
                label: 'Ensayos',
                automationId: 'menu-ensayos',
                items: [
                    {
                        label: 'Administración',
                        automationId: 'menu-ensayos-administracion',
                        routerLink: '/'.concat(PageUrlName.availableTest)
                    },
                    {
                        label: 'Historial',
                        automationId: 'menu-ensayos-historial',
                        routerLink: '/'.concat(PageUrlName.history)
                    }
                ]
            },
            {
                label: 'Medidores',
                automationId: 'menu-medidores',
                items: [
                    {
                        label: 'Modelos',
                        automationId: 'menu-medidores-modelos',
                        routerLink: '/'.concat(PageUrlName.meters)
                    },
                    {
                        label: 'Marcas',
                        automationId: 'menu-medidores-marcas',
                        routerLink: '/'.concat(PageUrlName.brands)
                    }
                    // {
                    //   label: 'Usuarios',
                    //   routerLink: '/'.concat(PageUrlName.users),
                    // },
                ]
            },
            // {
            //     label: 'Estadísticas',
            //     routerLink: '/'.concat(PageUrlName.dashboard)
            // },
            {
                label: 'Backup',
                automationId: 'menu-backup',
                items: [
                    {
                        label: 'Crear',
                        automationId: 'menu-backup-crear',
                        routerLink: '/'.concat(PageUrlName.backupCreate)
                    },
                    {
                        label: 'Restaurar',
                        automationId: 'menu-backup-restaurar',
                        routerLink: '/'.concat(PageUrlName.backupRestore)
                    }
                ]
            }
            // {
            //   label: 'Terminal',
            //   routerLink: '/'.concat(PageUrlName.terminal),
            // },
        ];
        this.settingsItems = [
            {
                label: 'Base de datos',
                automationId: 'menu-configuracion-base-de-datos',
                command: () => this.showDataBaseDialog()
            },
            {
                label: 'Acerca de',
                automationId: 'menu-configuracion-acerca-de',
                command: () => this.aboutInfo()
            }
        ];
    }

    aboutInfo(): void {
        this.displaySystemInfoDialog = true;
    }

    showDataBaseDialog(): void {
        this.displayDataBaseDialog = true;
    }
}
