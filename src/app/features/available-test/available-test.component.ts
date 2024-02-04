import { Component, OnInit } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { filter, first, Observable, tap } from 'rxjs';
import { AbmPage } from '../../models/abm-page.model';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
  EssayTemplateTableColumns,
} from './models/essay-template.model';
import { MessagesService } from '../../services/messages.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  templateUrl: './available-test.component.html',
  styleUrls: ['./available-test.component.scss'],
})
export class AvailableTestComponent
  extends AbmPage<EssayTemplate>
  implements OnInit
{
  readonly title: string = 'Administración de ensayos disponibles';
  readonly haderIcon = PrimeIcons.BRIEFCASE;
  readonly cols = EssayTemplateTableColumns;
  readonly essayTemplates$: Observable<EssayTemplate[]>;

  constructor(
    private readonly dbService: DatabaseService<EssayTemplate>,
    private readonly messagesService: MessagesService
  ) {
    super(dbService, EssayTemplateDbTableContext);
    this.essayTemplates$ = this.refreshDataWhenDatabaseReply$(
      EssayTemplateDbTableContext.tableName
    );
  }

  ngOnInit(): void {
    this.dbService.getTable(EssayTemplateDbTableContext.tableName);
  }

  deleteEssayTemplates(ids: string[] = []) {
    this.dbService
      .deleteTableElements$(EssayTemplateDbTableContext.tableName, ids)
      .pipe(
        first(),
        filter(
          (numberOfElementsDeleted) => numberOfElementsDeleted === ids.length
        ),
        tap(() => {
          this.dbService.getTable(EssayTemplateDbTableContext.tableName);
          this.messagesService.success('Eliminado correctamente');
        })
      )
      .subscribe({
        error: () =>
          this.messagesService.error(
            'Verifique que ningun elemento este en uso antes de eliminar'
          ),
      });
  }
}
