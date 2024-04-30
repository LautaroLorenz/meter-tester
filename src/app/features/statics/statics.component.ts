import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  Observable,
  takeUntil,
  tap,
  startWith,
  Subject,
  take,
  map,
  concat,
  catchError,
  throwError,
} from 'rxjs';
import { StaticsService } from '../../services/statics.service';
import { Metric } from '../../models/business/enums/metric.model';
import { Tags } from '../../models/business/database/static.model';
import { MessagesService } from '../../services/messages.service';

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
  readonly top = 10;
  readonly metricsDataMap: Record<Metric, Tags[]> = {
    [Metric.standUsed]: [],
    [Metric.meterModelApproved]: [],
    [Metric.meterModelFailed]: [],
  };

  private readonly onDestroy = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly staticsService: StaticsService,
    private readonly messagesService: MessagesService
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
    const observables: Observable<Tags[]>[] = [];

    observables.push(
      this.staticsService.getMetric$(Metric.standUsed, before, after).pipe(
        take(1),
        map((metrics) => metrics.map(({ tags_raw }) => tags_raw)),
        tap((response) => (this.metricsDataMap.standUsed = response))
      )
    );
    observables.push(
      this.staticsService
        .getMetric$(Metric.meterModelApproved, before, after)
        .pipe(
          take(1),
          map((metrics) => metrics.map(({ tags_raw }) => tags_raw)),
          tap((response) => (this.metricsDataMap.meterModelApproved = response))
        )
    );
    observables.push(
      this.staticsService
        .getMetric$(Metric.meterModelFailed, before, after)
        .pipe(
          take(1),
          map((metrics) => metrics.map(({ tags_raw }) => tags_raw)),
          tap((response) => (this.metricsDataMap.meterModelFailed = response))
        )
    );

    concat(...observables)
      .pipe(
        catchError((err: Error) => {
          this.messagesService.error('No se pudo obtener las estadísticas');
          return throwError(() => err);
        })
      )
      .subscribe();
  }
}
