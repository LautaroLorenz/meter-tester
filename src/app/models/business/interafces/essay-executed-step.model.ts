import { ExecutedStatus } from '../enums/executed-status.model';
import { EssayVerifiedStep } from './essay-verified-step.model';
import { Stand } from './stand.model';

export interface ExecutionResult<T = any> {
  stand: Stand;
  value: T;
}

export interface EssayExecutedStep extends EssayVerifiedStep {
  executedStatus: ExecutedStatus;
  executionResults: ExecutionResult[];
}
