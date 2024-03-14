import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { PageUrlName } from '../../models/business/enums/page-name.model';
import { NavigationService } from '../../services/navigation.service';
import {
  Observable,
  Subject,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
} from '../../models/business/database/essay-template.model';
import {
  EssayTemplateStep,
  EssayTemplateStepDbTableContext,
} from '../../models/business/database/essay-template-step.model';
import { RunEssayForm } from '../../models/business/interafces/run-essay.model';
import { FormBuilder } from '@angular/forms';
import {
  FormatDateMode,
  FormatDatePipe,
} from '../../pipes/core/fomat-date.pipe';
import { WhereKind, WhereOperator } from '../../models/core/database.model';
import { RelationsManager } from '../../models/core/relations-manager.model';
import { RunEssayService } from '../../services/run-essay.service';

@Component({
  selector: 'app-run-essay',
  templateUrl: './run-essay.component.html',
  styleUrls: ['./run-essay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunEssayComponent implements OnInit, OnDestroy {
  readonly title: string = 'Ensayo';
  readonly id$: Observable<number>;
  readonly runEssayForm: RunEssayForm;

  private readonly formatDate = inject(FormatDatePipe);
  private readonly onDestroy = new Subject<void>();

  // get stepControls(): FormArray<FormControl> {
  //   return (this.form.get('essayTemplateSteps') as FormArray);
  // }
  // get activeAction$(): Observable<Action | null> {
  //   return this.executionDirectorService.activeAction$;
  // }
  // get activeStepIndex$(): Observable<number | null> {
  //   return this.executionDirectorService.activeStepIndex$;
  // }
  // get activeActionIndex$(): Observable<number | null> {
  //   return this.executionDirectorService.activeActionIndex$;
  // }
  // get executionStatus$(): Observable<ExecutionStatus> {
  //   return this.executionDirectorService.executionStatus$;
  // }

  constructor(
    private readonly fb: FormBuilder,
    private readonly dbServiceEssayTemplate: DatabaseService<EssayTemplate>,
    private readonly dbServiceEssayTemplateStep: DatabaseService<EssayTemplateStep>,
    private readonly route: ActivatedRoute,
    //   private readonly executionDirectorService: ExecutionDirector,
    //   private readonly staticsService: StaticsService,
    private readonly navigationService: NavigationService,
    public readonly runEssayService: RunEssayService
  ) {
    this.id$ = this.getId$();
    this.runEssayForm = this.buildForm();
  }

  // private buildSteps(essayTemplateSteps: EssayTemplateStep[]): void {
  //   this.stepBuilders = [];
  //   essayTemplateSteps.forEach((essayTemplateStep) => {
  //     const newStep: StepBuilder = StepConstructor.buildStepById(essayTemplateStep.step_id, essayTemplateStep, this.destroyed$);
  //     newStep.buildStepForm();
  //     newStep.form.patchValue(essayTemplateStep.actions_raw_data);
  //     this.stepBuilders.push(newStep);
  //   });
  // }

  ngOnInit(): void {
    this.observeRoute();
    this.observeTables();
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  exit() {
    this.navigationService.back({ targetPage: PageUrlName.availableTest });
  }

  // executeNext(): void {
  //   this.executionDirectorService.executeNext();
  // }

  // goToHistory(): void {
  //   this.staticsService.increment$(MetricEnum.execution, { essay: this.essayName }).pipe(
  //     take(1),
  //     tap(() => {
  //       setTimeout(() => {
  //         this.navigationService.back({ targetPage: PageUrlName.historyAndReports });
  //       })
  //     })
  //   ).subscribe();
  // }

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
        tap(() => this.runEssayForm.reset()),
        switchMap((id) =>
          this.dbServiceEssayTemplate.getTableElement$(
            EssayTemplateDbTableContext.tableName,
            id
          )
        ),
        tap(({ id, name }) =>
          this.runEssayForm.patchValue({
            essayTemplateId: id,
            essayName: name,
            startDate: this.formatDate.transform(
              new Date(),
              FormatDateMode.fromClientToDatabase
            ) as string,
          })
        ),
        tap(({ id }) => this.requestTableEssayTemplateSteps(id))
      )
      .subscribe();
  }

  private observeTables(): void {
    this.dbServiceEssayTemplateStep
      .getTableReply$(EssayTemplateStepDbTableContext.tableName)
      .pipe(
        takeUntil(this.onDestroy),
        map(({ rows, relations }) => {
          const { foreignTables } = EssayTemplateStepDbTableContext;
          return RelationsManager.mergeRelationsIntoRows<EssayTemplateStep>(
            rows,
            relations,
            foreignTables
          );
        }),
        map((essayTemplateStep) =>
          essayTemplateStep.sort((a, b) => a.order - b.order)
        ),
        tap(() => (this.runEssayService.runEssayForm = this.runEssayForm)),
        tap((essayTemplateSteps) =>
          this.runEssayService.buildSteps(essayTemplateSteps)
        ),
        tap(() => this.runEssayService.inferOptionalStepsProps()),
        tap(() => this.runEssayService.reset()),
        // TODO
        tap(() => console.log(this.runEssayForm.getRawValue().essaySteps))
      )
      .subscribe();
  }

  private requestTableEssayTemplateSteps(essayTemplateId: number): void {
    const { foreignTables } = EssayTemplateStepDbTableContext;
    const { tableName: essayTemplateTableName } = EssayTemplateDbTableContext;
    const foreignTablesFiltered = foreignTables.filter(
      ({ tableName }) => tableName !== essayTemplateTableName
    );
    this.dbServiceEssayTemplateStep.getTable(
      EssayTemplateStepDbTableContext.tableName,
      {
        relations: foreignTablesFiltered,
        conditions: [
          {
            kind: WhereKind.where,
            columnName: 'essay_template_id',
            operator: WhereOperator.equal,
            value: essayTemplateId,
          },
        ],
      },
      EssayTemplateStepDbTableContext.rawProperties
    );
  }

  private buildForm(): RunEssayForm {
    return this.fb.group({
      essayName: undefined,
      essayTemplateId: undefined,
      startDate: undefined,
      endDate: undefined,
      essaySteps: this.fb.array([]),
    }) as RunEssayForm;
  }
}
