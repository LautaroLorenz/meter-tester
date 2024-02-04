import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { PageUrlName } from '../menu/models/page-name.model';

@Component({
  selector: 'app-tab-menu-test',
  templateUrl: './tab-menu-test.component.html',
  styleUrls: ['./tab-menu-test.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabMenuTestComponent {
  readonly items: MenuItem[];

  constructor() {
    this.items = [
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
    ];
  }
}
