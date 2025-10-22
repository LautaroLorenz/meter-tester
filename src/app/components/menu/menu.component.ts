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
                items: [
                    {
                        label: 'Administración',
                        routerLink: '/'.concat(PageUrlName.availableTest)
                    },
                    {
                        label: 'Historial',
                        routerLink: '/'.concat(PageUrlName.history)
                    }
                ]
            },
            {
                label: 'Medidores',
                items: [
                    {
                        label: 'Modelos',
                        routerLink: '/'.concat(PageUrlName.meters)
                    },
                    {
                        label: 'Marcas',
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
                items: [
                    {
                        label: 'Crear',
                        routerLink: '/'.concat(PageUrlName.backupCreate)
                    },
                    {
                        label: 'Restaurar',
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
                command: () => this.showDataBaseDialog()
            },
            {
                label: 'Acerca de',
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
