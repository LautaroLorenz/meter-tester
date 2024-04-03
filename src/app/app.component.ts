import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, filter, take } from 'rxjs';
import { PageUrlName } from './models/business/enums/page-name.model';
import { Title } from '@angular/platform-browser';
import { BlockUIService } from './services/block-ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isVirtualMachinePage = false;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly blockUIService: BlockUIService
  ) {
    this.translate.setDefaultLang('en');
  }

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
        this.isVirtualMachinePage =
          (event as NavigationEnd).url === `/${PageUrlName.virtualMachine}`;
        if (this.isVirtualMachinePage) {
          this.titleService.setTitle('Máquina virtual');
        }
      });
  }
}
