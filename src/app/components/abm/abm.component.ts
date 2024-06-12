import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfirmationService, LazyLoadEvent, MenuItem, PrimeIcons } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { Subject, takeUntil, tap } from 'rxjs';
import { TC_FilterType, TableColumn } from '../../models/core/table-column.model';
import { AbmColumnTemplateNameDirective } from '../../directives/abm-column-template-name.directive';

@Component({
    selector: 'app-abm',
    templateUrl: './abm.component.html',
    styleUrls: ['./abm.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbmComponent implements OnChanges, OnInit, AfterContentInit, OnDestroy {
    @Input() dataset: any[] = [];
    @Input() totalRecords = 0;
    @Input() columns: TableColumn[] = [];
    @Input() paginator = true;
    @Input() detailFormValid = false;
    @Input() toolbar = true;
    @Input() deleteButton = true;
    @Input() abmDetailTemplate: TemplateRef<any> | null = null;
    @Input() tableColumnButtonsTemplate: TemplateRef<any> | null = null;

    @Output() deleteEvent = new EventEmitter<string[]>();
    @Output() saveDetailEvent = new EventEmitter<any>();
    @Output() openDetailEvent = new EventEmitter<any>();
    @Output() lazyLoad = new EventEmitter<LazyLoadEvent>();

    @ViewChild('primeNgTable', { static: true }) primeNgTable: Table | undefined;
    @ViewChildren('columnFilter') columnFilters!: QueryList<ColumnFilter>;
    @ContentChildren(AbmColumnTemplateNameDirective)
    templateColumns!: QueryList<AbmColumnTemplateNameDirective>;

    readonly TC_FilterType = TC_FilterType;
    readonly checkboxColumnMenuItems: MenuItem[] = [];
    readonly rows = 20;
    readonly search: FormControl;

    showClearFilterButton = false;
    clearFilterButtonDisabled = true;
    detailDialogVisible = false;

    private readonly onDestroy$ = new Subject<void>();

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
        if (changes.columns) {
            this.showClearFilterButton = this.getShowClearFilterButton(changes.columns.currentValue as TableColumn[]);
        }
    }

    ngOnInit(): void {
        this.observeLazyLoadEvent();
    }

    ngAfterContentInit(): void {
        this.initColumnTemplates();
    }

    clearSearch(): void {
        this.search.setValue('');
    }

    clearFilters(): void {
        this.columnFilters.forEach((columnFilter) => columnFilter.clearFilter());
    }

    filterByText(value: string): void {
        this.primeNgTable?.filterGlobal(value, 'contains');
    }

    deleteElement(element: any): void {
        this.confirmationService.confirm({
            message: '¿Eliminar fila de la tabla?',
            header: 'Confirmar borrado',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            defaultFocus: 'reject',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteEvent.emit([element.id]);
            }
        });
    }

    editElement(element: any): void {
        this.openDialog(element);
    }

    createElement(): void {
        this.openDialog({});
    }

    openDialog(element: any): void {
        if (!this.abmDetailTemplate) {
            throw new Error('@Input() abmDetailTemplate is undefined');
        }

        this.detailDialogVisible = true;
        this.openDetailEvent.emit(element);
    }

    saveElement(): void {
        this.saveDetailEvent.emit();
    }

    closeDialog(): void {
        this.detailDialogVisible = false;
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private initFormValueChangeListeners(): void {
        this.search.valueChanges
            .pipe(
                takeUntil(this.onDestroy$),
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
                (col) => 'templateName' in col && col.templateName === abmColumnTemplateName
            );
            if (column && 'template' in column) {
                column.template = templateRef;
            }
        });
    }

    private getShowClearFilterButton(columns: TableColumn[]): boolean {
        return columns.some((column) => column.filter);
    }

    private getHasFilters(): boolean {
        return this.columnFilters?.some((columnFilter) => columnFilter.hasFilter());
    }

    private observeLazyLoadEvent(): void {
        this.lazyLoad
            .pipe(
                takeUntil(this.onDestroy$),
                tap(() => (this.clearFilterButtonDisabled = !this.getHasFilters()))
            )
            .subscribe();
    }
}
