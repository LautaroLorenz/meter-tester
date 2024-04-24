import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { takeUntil, tap, startWith, Subject, take } from 'rxjs';
import { StaticsService } from '../../services/statics.service';
import { Metric } from '../../models/business/enums/metric.model';

@Component({
  templateUrl: './statics.component.html',
  styleUrls: ['./statics.component.scss'],
})
export class StaticsComponent implements OnInit, OnDestroy {
  readonly title = 'Estadísticas';
  readonly filtersForm: FormGroup<{
    dateBefore: FormControl<Date>;
    dateAfter: FormControl<Date>;
  }>;

  private readonly onDestroy = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly staticsService: StaticsService
  ) {
    this.filtersForm = this.buildFiltersForm();
  }

  ngOnInit(): void {
    this.observeFiltersForm();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private observeFiltersForm(): void {
    this.filtersForm.valueChanges
      .pipe(
        startWith(this.filtersForm.value),
        takeUntil(this.onDestroy),
        // el startWith dispara la primera carga de widgets data
        tap(() => {
          const { dateBefore, dateAfter } = this.filtersForm.getRawValue();
          this.reloadWidgets(dateBefore, dateAfter);
        })
      )
      .subscribe();
  }

  private buildFiltersForm(): FormGroup {
    const today = new Date();
    const before30days = new Date();
    before30days.setDate(before30days.getDate() - 30);

    return this.fb.nonNullable.group({
      dateBefore: [before30days],
      dateAfter: [today],
    });
  }

  private reloadWidgets(before: Date, after: Date): void {
    this.staticsService
      .getMetric$(Metric.standUsed, before, after)
      .pipe(take(1))
      .subscribe((response) => console.log('Metric', response));
  }
}
