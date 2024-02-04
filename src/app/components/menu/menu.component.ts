import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { PageUrlName } from './models/page-name.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  PageUrlName = PageUrlName;
  items: MenuItem[] = [];

  constructor() {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Ensayos',
        icon: PrimeIcons.CHECK_SQUARE,
        items: [
          {
            label: 'Ensayos disponibles',
            icon: PrimeIcons.BRIEFCASE,
            routerLink: '/'.concat(PageUrlName.availableTest),
          },
          // {
          //   label: 'Historial y reportes',
          //   icon: PrimeIcons.BOOK,
          //   routerLink: '/'.concat(PageUrlName.historyAndReports),
          // },
        ],
      },
      {
        label: 'ABMs',
        icon: PrimeIcons.FOLDER,
        items: [
          {
            label: 'Medidores',
            icon: PrimeIcons.BOX,
            routerLink: '/'.concat(PageUrlName.meters),
          },
          {
            label: 'Marcas',
            icon: PrimeIcons.BOOKMARK,
            routerLink: '/'.concat(PageUrlName.brands),
          },
          // {
          //   label: 'Usuarios',
          //   icon: PrimeIcons.USERS,
          //   routerLink: '/'.concat(PageUrlName.users),
          // },
        ],
      },
      // {
      //   label: 'Backup',
      //   icon: PrimeIcons.DATABASE,
      //   items: [
      //     {
      //       label: 'Importar',
      //       icon: PrimeIcons.UPLOAD,
      //       routerLink: '/'.concat(PageUrlName.import),
      //     },
      //     {
      //       label: 'Exportar',
      //       icon: PrimeIcons.DOWNLOAD,
      //       routerLink: '/'.concat(PageUrlName.export),
      //     },
      //   ],
      // },
      // {
      //   label: 'Terminal',
      //   icon: PrimeIcons.DESKTOP,
      //   routerLink: '/'.concat(PageUrlName.terminal),
      // },
    ];
  }
}
