import { ResultStatus } from '../enums/result-status.model';
import { Stand } from './stand.model';

export interface StandResult {
  standIndex: number;
  resultStatus: ResultStatus;
}

export type StandStandResult = Stand | StandResult;
