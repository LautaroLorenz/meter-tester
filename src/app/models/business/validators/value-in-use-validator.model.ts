import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import {
  Observable,
  take,
  tap,
  map,
  switchMap,
  debounceTime,
  first,
  Subject,
  takeUntil,
} from 'rxjs';
import { TableName } from '../../core/database.model';
import { DatabaseService } from '../../../services/database.service';
import { TC_MatchMode } from '../../core/table-column.model';

export const propInUseValidator = <T>(
  onDestroy: Subject<void>,
  dbService: DatabaseService<T>,
  tableName: TableName,
  prop: keyof T,
  skipSelf: any // su propio valor no cuenta como estar en uso
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return control.valueChanges.pipe(
      takeUntil(onDestroy),
      debounceTime(1000),
      take(1),
      tap((value) => {
        dbService.getTable(tableName, {
          lazyLoadEvent: {
            filters: {
              [`${tableName}.${prop.toString()}`]: {
                matchMode: TC_MatchMode.like,
                value,
              },
            },
            rows: 1,
          },
        });
      }),
      switchMap(() => dbService.getTableReply$(tableName).pipe(first())),
      map(({ rows }) => {
        if (
          rows.length > 0 &&
          ((!!skipSelf && rows[0][prop] !== skipSelf) || !skipSelf)
        ) {
          return { propInUse: true };
        }
        return null;
      })
    );
  };
};
