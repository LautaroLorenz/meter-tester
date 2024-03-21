import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { PageUrlName } from './models/business/enums/page-name.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isVirtualMachinePage = false;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe((event) => {
        this.isVirtualMachinePage =
          (event as NavigationEnd).url === `/${PageUrlName.virtualMachine}`;
      });
  }
}
