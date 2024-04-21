import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ConfirmationService,
  LazyLoadEvent,
  MenuItem,
  PrimeIcons,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { ReplaySubject, takeUntil, tap } from 'rxjs';
import { TableColumn } from '../../models/core/table-column.model';
import { AbmColumnTemplateNameDirective } from '../../directives/abm-column-template-name.directive';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.component.html',
  styleUrls: ['./abm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbmComponent implements OnChanges, AfterContentInit, OnDestroy {
  @Input() dataset: any[] = [];
  @Input() totalRecords = 0;
  @Input() columns: TableColumn[] = [];
  @Input() paginator = true;
  @Input() detailFormValid = false;
  @Input() toolbar = true;
  @Input() deleteButton = true;
  @Input() actionColumnStyleClass = 'w-8rem';
  @Input() abmDetailTemplate: TemplateRef<any> | null = null;
  @Input() tableColumnButtonsTemplate: TemplateRef<any> | null = null;

  @Output() deleteEvent = new EventEmitter<string[]>();
  @Output() saveDetailEvent = new EventEmitter<any>();
  @Output() openDetailEvent = new EventEmitter<any>();
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>();

  @ViewChild('primeNgTable', { static: true }) primeNgTable: Table | undefined;
  @ContentChildren(AbmColumnTemplateNameDirective)
  templateColumns!: QueryList<AbmColumnTemplateNameDirective>;

  readonly checkboxColumnMenuItems: MenuItem[] = [];
  readonly rows = 5;
  readonly search: FormControl;

  detailDialogVisible = false;

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private readonly confirmationService: ConfirmationService) {
    this.search = new FormControl('');
    this.initFormValueChangeListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataset) {
      const { dataset } = changes;
      if (dataset.currentValue !== dataset.previousValue) {
        this.closeDialog();
      }
    }
  }

  ngAfterContentInit(): void {
    this.initColumnTemplates();
  }

  clearSearch(): void {
    this.search.setValue('');
  }

  filterByText(value: string): void {
    this.primeNgTable?.filterGlobal(value, 'contains');
  }

  deleteElement(element: any) {
    this.confirmationService.confirm({
      message: '¿Eliminar fila de la tabla?',
      header: 'Confirmar borrado',
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteEvent.emit([element.id]);
      },
    });
  }

  editElement(element: any) {
    this.openDialog(element);
  }

  createElement() {
    this.openDialog({});
  }

  openDialog(element: any): void {
    if (!this.abmDetailTemplate) {
      throw new Error('@Input() abmDetailTemplate is undefined');
    }

    this.detailDialogVisible = true;
    this.openDetailEvent.emit(element);
  }

  saveElement() {
    this.saveDetailEvent.emit();
  }

  closeDialog() {
    this.detailDialogVisible = false;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initFormValueChangeListeners(): void {
    this.search.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        tap((value: string) => this.filterByText(value))
      )
      .subscribe();
  }

  private initColumnTemplates(): void {
    if (!this.templateColumns.length) {
      return;
    }
    this.templateColumns.forEach(({ abmColumnTemplateName, templateRef }) => {
      const column = this.columns.find(
        (col) =>
          'templateName' in col && col.templateName === abmColumnTemplateName
      );
      if (column && 'template' in column) {
        column.template = templateRef;
      }
    });
  }
}
