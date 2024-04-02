import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResultStatus } from '../../models/business/enums/result-status.model';

@Component({
  selector: 'app-result-status',
  templateUrl: './result-status.component.html',
  styleUrls: ['./result-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultStatusComponent {
  @Input() resultStatus!: ResultStatus;

  get styleClass(): string {
    const classes: string[] = [];
    if (this.severity === 'surface') {
      classes.push('bg-surface-200');
    }
    if (this.severity === 'info') {
      classes.push('bg-blue-400');
    }
    if (this.severity === 'success') {
      classes.push('bg-green-400');
    }
    if (this.severity === 'danger') {
      classes.push('bg-red-400');
    }
    if (this.severity === 'warning') {
      classes.push('bg-orange-400');
    }
    if (
      this.severity === 'info' ||
      this.severity === 'success' ||
      this.severity === 'warning' ||
      this.severity === 'danger'
    ) {
      classes.push('text-white');
    }
    return classes.join(' ');
  }

  get severity(): 'surface' | 'info' | 'success' | 'danger' | 'warning' | undefined {
    switch (this.resultStatus) {
      case ResultStatus.NotApply:
      case ResultStatus.Unknown:
        return undefined;
      case ResultStatus.Pending:
        return 'surface';
      case ResultStatus.WorkInProgress:
        return 'info';
      case ResultStatus.Approved:
        return 'success';
      case ResultStatus.Failed:
        return 'warning';
    }
  }

  get text(): string | undefined {
    switch (this.resultStatus) {
      case ResultStatus.NotApply:
      case ResultStatus.Unknown:
        return undefined;
      case ResultStatus.Pending:
        return 'En espera';
      case ResultStatus.WorkInProgress:
        return 'Calculando';
      case ResultStatus.Approved:
        return 'Aprobado';
      case ResultStatus.Failed:
        return 'Falló';
    }
  }

  get icon(): string | undefined {
    switch (this.resultStatus) {
      case ResultStatus.Unknown:
      case ResultStatus.NotApply:
      case ResultStatus.Pending:
        return undefined;
      case ResultStatus.Approved:
        return 'pi pi-check';
      case ResultStatus.Failed:
        return 'pi pi-times';
    }
  }
}
