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
        items: [
          {
            label: 'Ensayos',
            routerLink: '/'.concat(PageUrlName.availableTest),
          },
          {
            label: 'Historial',
            routerLink: '/'.concat(PageUrlName.history),
          },
        ],
      },
      {
        label: 'ABMs',
        items: [
          {
            label: 'Medidores',
            routerLink: '/'.concat(PageUrlName.meters),
          },
          {
            label: 'Marcas',
            routerLink: '/'.concat(PageUrlName.brands),
          },
          // {
          //   label: 'Usuarios',
          //   routerLink: '/'.concat(PageUrlName.users),
          // },
        ],
      },
      // {
      //   label: 'Backup',
      //   items: [
      //     {
      //       label: 'Importar',
      //       routerLink: '/'.concat(PageUrlName.import),
      //     },
      //     {
      //       label: 'Exportar',
      //       routerLink: '/'.concat(PageUrlName.export),
      //     },
      //   ],
      // },
      // {
      //   label: 'Terminal',
      //   routerLink: '/'.concat(PageUrlName.terminal),
      // },
    ];
  }
}
