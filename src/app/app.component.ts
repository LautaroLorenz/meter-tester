import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, filter, take, timer, switchMap } from 'rxjs';
import { PageUrlName } from './models/business/enums/page-name.model';
import { Title } from '@angular/platform-browser';
import { BlockUIService } from './services/block-ui.service';
import { IpcService } from './services/ipc.service';
import { MessagesService } from './services/messages.service';

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
    private readonly blockUIService: BlockUIService,
    private readonly ipcService: IpcService,
    private readonly messagesService: MessagesService
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

    timer(3000)
      .pipe(
        take(1),
        switchMap(() =>
          this.ipcService.invoke$('get-database-connection-status')
        )
      )
      .subscribe(({ status, created }) => {
        if (!status) {
          this.messagesService.error('Error de conexión a la base de datos');
        }
        if (created) {
          this.messagesService.info('Base de datos creada', true);
        }
      });

    timer(3000)
      .pipe(
        take(1),
        switchMap(() =>
          this.ipcService.invoke$('get-database-connection-status')
        )
      )
      .subscribe(({ status, created, location }) => {
        if (!status) {
          this.messagesService.error('Error de conexión a la base de datos');
        }
        if (created) {
          this.messagesService.info('Base de datos creada', true);
        }
        if (location) {
          console.log(location);
        }
      });
  }
}
