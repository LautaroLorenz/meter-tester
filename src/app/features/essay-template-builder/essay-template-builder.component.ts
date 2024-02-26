/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, PrimeIcons } from 'primeng/api';
import {
  catchError,
  filter,
  first,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { ComponentCanDeactivate } from '../../guards/peding-changes.guard';
import { DatabaseService } from '../../services/database.service';
import { MessagesService } from '../../services/messages.service';
import {
  Step,
  StepDbTableContext,
} from '../../models/business/database/step.model';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
} from '../../models/business/database/essay-template.model';
import {
  EssayTemplateStep,
  EssayTemplateStepDbTableContext,
} from '../../models/business/database/essay-template-step.model';
import { WhereKind, WhereOperator } from '../../models/core/database.model';
import { PageUrlName } from '../../components/menu/models/page-name.model';
import { EssayService } from '../../services/essay.service';
import { RelationsManager } from '../../models/core/relations-manager.model';
import {
  EssayTemplateForm,
  EssayTemplateFormGroup,
} from '../../models/business/forms/essay-template-form.model';
import { NavigationService } from '../../services/navigation.service';
import { essayTemplateValidator } from '../../models/business/forms/essay-template-form-validator.model';
import { Steps } from '../../models/business/enums/steps.model';

@Component({
  templateUrl: './essay-template-builder.component.html',
  styleUrls: ['./essay-template-builder.component.scss'],
})
export class EssayTemplateBuilderComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate
{
  addStepToSequenceDialogOpened = false;
  selectedEssayTemplateStep: Partial<EssayTemplateStep> | undefined;
  steps: Step[] | undefined;

  readonly title: string = 'Ensayo';
  readonly id$: Observable<number>;
  readonly form: FormGroup;
  readonly saveButtonMenuItems: MenuItem[] = [];

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navigationService: NavigationService,
    private readonly fb: FormBuilder,
    private readonly dbServiceSteps: DatabaseService<Step>,
    private readonly messagesService: MessagesService,
    private readonly essayService: EssayService,
    private readonly dbService: DatabaseService<EssayTemplate>,
    private readonly dbServiceEssayTemplateStep: DatabaseService<EssayTemplateStep>,
    private readonly confirmationService: ConfirmationService
  ) {
    this.form = this.buildForm();
    this.saveButtonMenuItems = this.getSaveButtonMenuItems();
    this.id$ = this.getId$();
  }

  get saveButtonDisabled(): boolean {
    return !this.form.valid || this.form.pristine;
  }

  get stepsFormArray(): FormArray<FormControl<Partial<EssayTemplateStep>>> {
    return this.form.get('essayTemplateSteps') as FormArray<
      FormControl<Partial<EssayTemplateStep>>
    >;
  }

  get stepsSequenceTable(): Partial<EssayTemplateStep>[] {
    return (this.stepsFormArray?.value ?? []).filter(
      ({ step_id }) => step_id !== Steps.Preparation
    );
  }

  get preparationStep(): Partial<EssayTemplateStep> | undefined {
    return (this.stepsFormArray?.value ?? []).find(
      ({ step_id }) => step_id === Steps.Preparation
    );
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> {
    return of(this.form.dirty).pipe(
      first(),
      switchMap((confirm) => {
        if (!confirm) {
          return of(true);
        } else {
          return new Observable<boolean>((observer) => {
            this.confirmationService.confirm({
              message: 'Salir sin guardar',
              header: '¿Confirma qué quiere salir sin guardar?',
              icon: PrimeIcons.EXCLAMATION_TRIANGLE,
              defaultFocus: 'reject',
              acceptButtonStyleClass: 'p-button-outlined',
              accept: () => {
                observer.next(true);
                observer.complete();
              },
              reject: () => {
                observer.next(false);
                observer.complete();
              },
            });
          });
        }
      })
    );
  }

  ngOnInit(): void {
    this.observeRoute();
    this.observeTables();
    this.requestToolsTables();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  exit(): void {
    this.navigationService.back({ targetPage: PageUrlName.availableTest });
  }

  save(): void {
    this.save$().subscribe();
  }

  deleteEssayTemplateStepControl(index: number): void {
    this.confirmationService.confirm({
      message: '¿Eliminar fila de la tabla?',
      header: 'Confirmar borrado',
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.stepsFormArray.removeAt(index);
        this.recalculateEssayTemplateStepsOrder();
        this.stepsFormArray.markAsDirty();
      },
    });
  }

  moveDownByIndex(indexFrom: number): void {
    if (indexFrom === null) {
      return;
    }
    if (indexFrom === this.stepsFormArray.length - 1) {
      return;
    }
    const indexTo = indexFrom + 1;
    const temp = this.stepsFormArray.at(indexFrom);
    this.stepsFormArray.removeAt(indexFrom);
    this.stepsFormArray.insert(indexTo, temp);
    this.recalculateEssayTemplateStepsOrder();
    this.stepsFormArray.markAsDirty();
  }

  moveUpByIndex(indexFrom: number): void {
    if (indexFrom === null) {
      return;
    }
    if (indexFrom === 0) {
      return;
    }
    const indexTo = indexFrom - 1;
    const temp = this.stepsFormArray.at(indexFrom);
    this.stepsFormArray.removeAt(indexFrom);
    this.stepsFormArray.insert(indexTo, temp);
    this.recalculateEssayTemplateStepsOrder();
    this.stepsFormArray.markAsDirty();
  }

  saveEditedStepInSequenceChanges(
    essayTemplateStep: Partial<EssayTemplateStep>
  ): void {
    if (!this.selectedEssayTemplateStep) {
      return;
    }
    if (typeof this.selectedEssayTemplateStep.order !== 'number') {
      return;
    }
    this.stepsFormArray
      .at(this.selectedEssayTemplateStep.order)
      .patchValue(essayTemplateStep);
    this.stepsFormArray.markAsDirty();
  }

  addEssayTemplateStepControlByStep(
    step: Step,
    { markForCheck } = { markForCheck: true }
  ): void {
    const essayTemplateStep: Partial<EssayTemplateStep> = {
      step_id: step.id,
      foreign: {
        step: { ...step },
      },
    };
    this.addEssayTemplateStepControl(essayTemplateStep);

    if (markForCheck) {
      this.stepsFormArray.markAsDirty();
    }
  }

  private addDefaultEssayTemplateStepsControl(steps: Step[]): void {
    if (!steps) {
      return;
    }
    if (this.stepsFormArray.length > 0) {
      return;
    }
    const defaultEssayTemplateSteps = steps.filter((step) =>
      [Steps.Preparation].includes(step.id)
    );
    defaultEssayTemplateSteps.forEach((step) =>
      this.addEssayTemplateStepControlByStep(step, { markForCheck: false })
    );
  }

  private addEssayTemplateStepControl(
    essayTemplateStep: EssayTemplateStep | Partial<EssayTemplateStep>
  ): void {
    this.stepsFormArray.push(
      this.fb.control(essayTemplateStep, { nonNullable: true })
    );
    this.recalculateEssayTemplateStepsOrder();
  }

  private recalculateEssayTemplateStepsOrder(): void {
    this.stepsFormArray.controls.forEach((control, index) => {
      control.setValue({
        ...control.value,
        order: index,
      });
    });
  }

  private addSavedEssayTemplateStepsControl(
    essayTemplateSteps: EssayTemplateStep[]
  ): void {
    this.stepsFormArray.clear();
    essayTemplateSteps.forEach((essayTemplateStep) =>
      this.addEssayTemplateStepControl(essayTemplateStep)
    );
  }

  private observeRoute(): void {
    this.id$
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((id) =>
          this.dbService.getTableElement$(
            EssayTemplateDbTableContext.tableName,
            id
          )
        ),
        tap((essayTemplate) =>
          this.form.get('essayTemplate')?.patchValue(essayTemplate)
        ),
        tap(({ id }) => this.requestTableEssayTemplateSteps(id))
      )
      .subscribe();
  }

  private observeTables(): void {
    this.dbServiceEssayTemplateStep
      .getTableReply$(EssayTemplateStepDbTableContext.tableName)
      .pipe(
        takeUntil(this.destroyed$),
        map(({ rows, relations }) => {
          const { foreignTables } = EssayTemplateStepDbTableContext;
          return RelationsManager.mergeRelationsIntoRows<EssayTemplateStep>(
            rows,
            relations,
            foreignTables
          );
        }),
        map((essayTemplateSteps) =>
          essayTemplateSteps.sort((a, b) => a.order - b.order)
        ),
        tap((essayTemplateSteps) =>
          this.addSavedEssayTemplateStepsControl(essayTemplateSteps)
        )
      )
      .subscribe();
  }

  private requestTableEssayTemplateSteps(essayTemplateId: number): void {
    const { foreignTables } = EssayTemplateStepDbTableContext;
    const { tableName: essayTemplateTableName } = EssayTemplateDbTableContext;
    const foreignTablesFiltered = foreignTables.filter(
      (ft) => ft.tableName !== essayTemplateTableName
    );
    const getTableOptions = {
      relations: foreignTablesFiltered,
      conditions: [
        {
          kind: WhereKind.where,
          columnName: 'essay_template_id',
          operator: WhereOperator.equal,
          value: essayTemplateId,
        },
      ],
    };
    this.dbServiceEssayTemplateStep.getTable(
      EssayTemplateStepDbTableContext.tableName,
      getTableOptions,
      EssayTemplateStepDbTableContext.rawProperties
    );
  }

  private requestToolsTables(): void {
    this.dbServiceSteps.getTable(StepDbTableContext.tableName, {
      relations: StepDbTableContext.foreignTables,
    });

    this.dbServiceSteps
      .getTableReply$(StepDbTableContext.tableName)
      .pipe(
        takeUntil(this.destroyed$),
        map((response) =>
          RelationsManager.mergeRelationsIntoRows<Step>(
            response.rows,
            response.relations,
            StepDbTableContext.foreignTables
          )
        ),
        tap((response) => (this.steps = response)),
        tap((response) => this.addDefaultEssayTemplateStepsControl(response))
      )
      .subscribe();
  }

  private buildForm(): FormGroup {
    return this.fb.group<EssayTemplateFormGroup>(
      {
        essayTemplate: this.fb.group<EssayTemplateForm>({
          id: this.fb.control(undefined, { nonNullable: true }),
          name: this.fb.control(undefined, {
            nonNullable: true,
            validators: Validators.required.bind(this),
          }),
        }),
        essayTemplateSteps: this.fb.array<
          FormControl<Partial<EssayTemplateStep>>
        >([]),
      },
      { validators: essayTemplateValidator() }
    );
  }

  private getId$(): Observable<number> {
    return this.route.queryParams.pipe(
      filter(({ id }) => id),
      map(({ id }) => id)
    );
  }

  private save$(): Observable<{
    essayTemplate: EssayTemplate;
    essayTemplateSteps: EssayTemplateStep[];
  }> {
    return of(this.form.valid).pipe(
      first(),
      filter((valid) => valid),
      map(() => this.form.getRawValue()),
      switchMap(({ essayTemplate, essayTemplateSteps }) =>
        this.essayService.saveEssayTemplate$(essayTemplate, essayTemplateSteps)
      ),
      tap((savedFormValue) => {
        this.messagesService.success('Guardado correctamente');
        this.form.reset(savedFormValue);
      }),
      catchError((e) => {
        this.messagesService.error('No se pudo guardar');
        return throwError(() => new Error(e));
      })
    );
  }

  private getSaveButtonMenuItems(): MenuItem[] {
    return [
      {
        label: 'Guardar y Salir',
        icon: PrimeIcons.SAVE,
        command: () =>
          this.save$()
            .pipe(tap(() => this.exit()))
            .subscribe(),
      },
      {
        label: 'Guardar y Ejecutar',
        icon: PrimeIcons.PLAY,
        command: () =>
          this.save$()
            .pipe(
              tap(({ essayTemplate: { id } }) =>
                this.navigationService.go(PageUrlName.runEssay, {
                  queryParams: { id },
                })
              )
            )
            .subscribe(),
      },
      {
        label: 'Guardar y Crear otro',
        icon: PrimeIcons.PLUS,
        command: () =>
          this.save$()
            .pipe(
              tap(() =>
                this.navigationService.go(PageUrlName.newEssayTemplate, {
                  forceReload: true,
                })
              )
            )
            .subscribe(),
      },
    ];
  }
}
