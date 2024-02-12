/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { Step, StepDbTableContext } from './models/step.model';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
} from '../available-test/models/essay-template.model';
import {
  EssayTemplateStep,
  EssayTemplateStepDbTableContext,
} from './models/essay-template-step.model';
import { WhereKind, WhereOperator } from '../../models/database.model';
import { PageUrlName } from '../../components/menu/models/page-name.model';
import { EssayService } from '../../services/essay.service';
import { RelationsManager } from '../../models/relations-manager.model';
import { EssayTemplateForm } from './models/essay-template-form.model';
import { NavigationService } from '../../services/navigation.service';
import { essayTemplateValidator } from './models/essate-template-form-validator.model';

@Component({
  templateUrl: './essay-template-builder.component.html',
  styleUrls: ['./essay-template-builder.component.scss'],
})
export class EssayTemplateBuilderComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate
{
  readonly title: string = 'Ensayo';
  // readonly id$: Observable<number>;
  readonly form: FormGroup;
  // readonly confirmBeforeBackHeader: string = 'Salir sin guardar';
  // readonly confirmBeforeBackText: string =
  //   '¿Confirma qué quiere salir sin guardar?';
  readonly saveButtonMenuItems: MenuItem[] = [];
  readonly steps$: Observable<Step[]>;

  // selectedIndex: number | null = null;
  // scrollToIndex: number | null = null;
  nameInputFocused = false;

  // get selectedControl(): FormControl | null {
  //   return this.hasSelectedIndex
  //     ? this.getEssaytemplateStepControls().controls[this.selectedIndex!]
  //     : null;
  // }
  // get hasSelectedIndex(): boolean {
  //   return this.selectedIndex !== null;
  // }
  get saveButtonDisabled(): boolean {
    return !this.form.valid || this.form.pristine;
  }
  // get confirmBeforeBack(): boolean {
  //   return this.form.dirty;
  // }

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // private readonly requestTableEssayTemplateSteps = (
  //   essayTemplateId: number
  // ): void => {
  //   const { foreignTables } = EssayTemplateStepDbTableContext;
  //   const { tableName: essayTemplateTableName } = EssayTemplateDbTableContext;
  //   const foreignTablesFiltered = foreignTables.filter(
  //     (ft) => ft.tableName !== essayTemplateTableName
  //   );
  //   const foreignTableNames = foreignTablesFiltered.map((ft) => ft.tableName);
  //   const getTableOptions = {
  //     relations: foreignTableNames,
  //     conditions: [
  //       {
  //         kind: WhereKind.where,
  //         columnName: 'essay_template_id',
  //         operator: WhereOperator.equal,
  //         value: essayTemplateId,
  //       },
  //     ],
  //   };
  //   this.dbServiceEssayTemplateStep.getTable(
  //     EssayTemplateStepDbTableContext.tableName,
  //     getTableOptions
  //   );
  // };
  // private readonly addEssaytemplateStepControl = (
  //   essayTemplateStep: Partial<EssayTemplateStep>
  // ): void => {
  //   this.getEssaytemplateStepControls().push(
  //     new FormControl({
  //       ...essayTemplateStep,
  //       actions_raw_data: JSON.parse(
  //         essayTemplateStep?.actions_raw_data?.toString() || '[]'
  //       ),
  //     })
  //   );
  // };

  // private readonly route: ActivatedRoute,
  // private readonly dbService: DatabaseService<EssayTemplate>,
  // private readonly dbServiceEssayTemplateStep: DatabaseService<EssayTemplateStep>,
  // private readonly confirmationService: ConfirmationService
  constructor(
    private readonly navigationService: NavigationService,
    private readonly fb: FormBuilder,
    private readonly dbServiceSteps: DatabaseService<Step>,
    private readonly messagesService: MessagesService,
    private readonly essayService: EssayService
  ) {
    this.form = this.buildForm();
    this.steps$ = this.getSteps$();
    this.steps$.subscribe();
    this.saveButtonMenuItems = this.getSaveButtonMenuItems();

    // this.id$ = this.route.queryParams.pipe(
    //   filter(({ id }) => id),
    //   map(({ id }) => id)
    // );
  }

  ngOnInit(): void {
    this.requestToolsTables();
    // this.id$
    //   .pipe(
    //     takeUntil(this.destroyed$),
    //     switchMap((id) =>
    //       this.dbService.getTableElement$(
    //         EssayTemplateDbTableContext.tableName,
    //         id
    //       )
    //     ),
    //     tap((essayTemplate) =>
    //       this.form.get('essayTemplate')?.patchValue(essayTemplate)
    //     ),
    //     tap(({ id }) => this.requestTableEssayTemplateSteps(id))
    //   )
    //   .subscribe();
    // this.dbServiceEssayTemplateStep
    //   .getTableReply$(EssayTemplateStepDbTableContext.tableName)
    //   .pipe(
    //     takeUntil(this.destroyed$),
    //     map(({ rows, relations }) => {
    //       const { foreignTables } = EssayTemplateStepDbTableContext;
    //       return RelationsManager.mergeRelationsIntoRows<EssayTemplateStep>(
    //         rows,
    //         relations,
    //         foreignTables
    //       );
    //     }),
    //     map((essayTemplateStep) =>
    //       essayTemplateStep.sort((a, b) => a.order - b.order)
    //     ),
    //     tap((essayTemplateSteps) =>
    //       essayTemplateSteps.forEach((essayTemplateStep: EssayTemplateStep) =>
    //         this.addEssaytemplateStepControl(essayTemplateStep)
    //       )
    //     )
    //   )
    //   .subscribe();
  }

  // getEssaytemplateStepControls(): FormArray<FormControl> {
  //   return this.form.get('essayTemplateSteps') as FormArray<
  //     FormControl<EssayTemplateStep>
  //   >;
  // }

  // addEssayTemplateStep(step: Step): void {
  //   const newEssayTemplateStep: Partial<EssayTemplateStep> = {
  //     step_id: step.id,
  //     actions_raw_data: [],
  //     foreign: { step },
  //   };
  //   this.addEssaytemplateStepControl(newEssayTemplateStep);
  //   this.selectedIndex = this.getEssaytemplateStepControls().length - 1;
  //   this.scrollToIndex = this.selectedIndex;
  //   this.form.markAsDirty();
  // }

  exit(): void {
    this.navigationService.back({ targetPage: PageUrlName.availableTest });
  }

  save(): void {
    this.save$().subscribe();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> {
    return of(true);
    // return of(this.confirmBeforeBack).pipe(
    //   first(),
    //   switchMap((confirm) => {
    //     if (!confirm) {
    //       return of(true);
    //     } else {
    //       return new Observable<boolean>((observer) => {
    //         this.confirmationService.confirm({
    //           message: this.confirmBeforeBackText,
    //           header: this.confirmBeforeBackHeader,
    //           icon: PrimeIcons.EXCLAMATION_TRIANGLE,
    //           defaultFocus: 'reject',
    //           acceptButtonStyleClass: 'p-button-outlined',
    //           accept: () => {
    //             observer.next(true);
    //             observer.complete();
    //           },
    //           reject: () => {
    //             observer.next(false);
    //             observer.complete();
    //           },
    //         });
    //       });
    //     }
    //   })
    // );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private requestToolsTables(): void {
    this.dbServiceSteps.getTable(StepDbTableContext.tableName, {
      relations: StepDbTableContext.foreignTables.map((ft) => ft.tableName),
    });
  }

  private buildForm(): FormGroup {
    return this.fb.group<EssayTemplateForm>(
      {
        essayTemplate: this.fb.group<any>({
          id: this.fb.control(undefined),
          name: this.fb.control(''),
        }),
        essayTemplateSteps: this.fb.array<FormControl<any>>([]),
      },
      { validators: essayTemplateValidator() }
    );
  }

  private getSteps$(): Observable<Step[]> {
    return this.dbServiceSteps
      .getTableReply$(StepDbTableContext.tableName)
      .pipe(
        map((response) =>
          RelationsManager.mergeRelationsIntoRows<Step>(
            response.rows,
            response.relations,
            StepDbTableContext.foreignTables
          )
        )
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
                this.navigationService.go(PageUrlName.executeEssay, {
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
