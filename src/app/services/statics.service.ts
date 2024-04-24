import { Injectable } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { DatabaseService } from './database.service';
import {
  Static,
  StaticDbTableContext,
  Tags,
} from '../models/business/database/static.model';
import { TC_MatchMode, TC_Operator } from '../models/core/table-column.model';

@Injectable({
  providedIn: 'root',
})
export class StaticsService {
  constructor(private readonly dbService: DatabaseService<Static>) {}

  increment$(metric: string, tags?: Tags): Observable<number> {
    const staticValue: Omit<Static, 'id' | 'foreign'> = {
      saved_time: new Date().getTime(),
      metric,
      tags_raw: tags || [],
    };

    return this.dbService.addElementToTable$(
      StaticDbTableContext.tableName,
      staticValue,
      StaticDbTableContext.rawProperties
    );
  }

  getMetric$(
    metricValue: string,
    before: Date,
    after: Date
  ): Observable<Static[]> {
    this.dbService.getTable(
      StaticDbTableContext.tableName,
      {
        lazyLoadEvent: {
          filters: {
            [`${StaticDbTableContext.tableName}.saved_time`]: [
              {
                matchMode: TC_MatchMode.dateBefore,
                operator: TC_Operator.and,
                value: before.getTime(),
              },
              {
                matchMode: TC_MatchMode.dateAfter,
                operator: TC_Operator.and,
                value: after.getTime(),
              },
            ],
          },
        },
      },
      StaticDbTableContext.rawProperties
    );
    return this.dbService.getTableReply$(StaticDbTableContext.tableName).pipe(
      take(1),
      map(({ rows }) => rows.filter(({ metric }) => metric === metricValue))
    );
  }
}
