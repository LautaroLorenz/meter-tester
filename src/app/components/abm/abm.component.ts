import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfirmationService, MenuItem, PrimeIcons } from 'primeng/api';
import { Table } from 'primeng/table';
import { ReplaySubject, takeUntil, tap } from 'rxjs';
import { AbmColum } from './models/abm.model';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.component.html',
  styleUrls: ['./abm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbmComponent
  implements OnChanges, OnDestroy
{
  @Input() dataset: any[] = [];
  @Input() columns: AbmColum[] = [];
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

  @ViewChild('primeNgTable', { static: true }) primeNgTable: Table | undefined;

  readonly checkboxColumnMenuItems: MenuItem[] = [];
  readonly rows = 5;
  readonly search: FormControl;

  detailDialogVisible = false;

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly messagesService: MessagesService
  ) {
    this.search = new FormControl('');
    this.initFormValueChangeListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataset']) {
      const { dataset } = changes;
      if (dataset.currentValue !== dataset.previousValue) {
        this.closeDialog();
      }
    }
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
}
