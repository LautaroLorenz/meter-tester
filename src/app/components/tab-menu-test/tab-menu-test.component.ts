import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
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
        label: 'Ensayos',
        routerLink: '/'.concat(PageUrlName.availableTest),
      },
      {
        label: 'Historial',
        routerLink: '/'.concat(PageUrlName.history),
      },
    ];
  }
}
