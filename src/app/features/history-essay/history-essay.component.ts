import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { PageUrlName } from '../../models/business/enums/page-name.model';
import {
  Observable,
  filter,
  map,
  Subject,
  takeUntil,
  switchMap,
  tap,
  first,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import {
  HistoryEssay,
  HistoryEssayDbTableContext,
} from '../../models/business/database/history-essay.model';
import { MessagesService } from '../../services/messages.service';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { WhereKind, WhereOperator } from '../../models/core/database.model';
import { EssayStep } from '../../models/business/interafces/essay-step.model';
import { PreparationEssayStep } from '../../models/business/interafces/steps/preparation-step.model';

@Component({
  templateUrl: './history-essay.component.html',
  styleUrls: ['./history-essay.component.scss'],
})
export class HistoryEssayComponent implements OnInit, OnDestroy {
  historyEssay: HistoryEssay | undefined;
  executionSteps: EssayStep[] | undefined;
  preparationStep: PreparationEssayStep | undefined;

  readonly title: string = 'Historial de ejecución';
  readonly id$: Observable<number>;

  private readonly onDestroy: Subject<void> = new Subject();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navigationService: NavigationService,
    private readonly dbService: DatabaseService<HistoryEssay>,
    private readonly messagesService: MessagesService,
    private readonly confirmationService: ConfirmationService
  ) {
    this.id$ = this.getId$();
  }

  ngOnInit(): void {
    this.observeRoute();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  exit(): void {
    this.navigationService.back({ targetPage: PageUrlName.history });
  }

  deleteHistoryEssay(): void {
    if (!this.historyEssay?.id) {
      return;
    }
    this.confirmationService.confirm({
      header: '¿Eliminar historial de ejecución?',
      message: 'Se borrarán todos los registros asociados con esta ejecución',
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-outlined p-button-danger',
      accept: () => {
        this.dbService
          .deleteTableElements$(HistoryEssayDbTableContext.tableName, [
            this.historyEssay?.id,
          ])
          .pipe(
            first(),
            tap(() => {
              this.messagesService.success('Eliminado correctamente');
              this.exit();
            })
          )
          .subscribe({
            error: () =>
              this.messagesService.error('No se pudo eliminar los registros'),
          });
      },
    });
  }

  private getId$(): Observable<number> {
    return this.route.queryParams.pipe(
      filter(({ id }) => !!id),
      map(({ id }) => id as number)
    );
  }

  private observeRoute(): void {
    this.id$
      .pipe(
        takeUntil(this.onDestroy),
        switchMap((id) =>
          this.dbService.getTable$(
            HistoryEssayDbTableContext.tableName,
            {
              conditions: [
                {
                  columnName: 'id',
                  kind: WhereKind.andWhere,
                  operator: WhereOperator.equal,
                  value: id,
                },
              ],
            },
            HistoryEssayDbTableContext.rawProperties
          )
        ),
        map(({ rows: [historyEssay] }) => historyEssay),
        tap((historyEssay) => {
          this.historyEssay = historyEssay;
          this.preparationStep = historyEssay.run_raw
            .essaySteps[0] as PreparationEssayStep;
          this.executionSteps = historyEssay.run_raw.essaySteps.slice(1);
        })
      )
      .subscribe();
  }
}
