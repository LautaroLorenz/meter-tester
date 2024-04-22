import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from './database.service';
import {
  Static,
  StaticDbTableContext,
  Tags,
} from '../models/business/database/static.model';

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

  //   getMetric$(metricValue: string, from: number): Observable<Static[]> {
  //     this.dbService.getTable(StaticDbTableContext.tableName, {
  //       conditions: [{
  //         kind: WhereKind.where,
  //         columnName: 'metric',
  //         operator: WhereOperator.equal,
  //         value: metricValue
  //       }, {
  //         kind: WhereKind.andWhere,
  //         columnName: 'saved_time',
  //         operator: WhereOperator.major,
  //         value: from
  //       }]
  //     });
  //     return this.dbService.getTableReply$(StaticDbTableContext.tableName).pipe(
  //       map(({ rows }) => rows.filter(({ metric }) => metric === metricValue)),
  //       map((rows) => rows.map((row) => ({
  //         ...row,
  //         tags_raw: JSON.parse(row.tags_raw as unknown as string)
  //       })))
  //     );
  //   }
}
