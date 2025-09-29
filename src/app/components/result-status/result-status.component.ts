import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResultStatus } from '../../models/business/enums/result-status.model';

@Component({
    selector: 'app-result-status',
    templateUrl: './result-status.component.html',
    styleUrls: ['./result-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultStatusComponent {
    @Input() resultStatus!: ResultStatus;

    get styleClass(): string {
        const classes: string[] = ['py-1 px-2 gap-1'];
        const severity = this.severity;

        if (severity === 'surface') {
            classes.push('bg-surface-200', 'text-gray-700');
        }
        if (severity === 'info') {
            classes.push('bg-blue-100', 'text-blue-800');
        }
        if (severity === 'success') {
            classes.push('bg-green-100', 'text-green-800');
        }
        if (severity === 'danger') {
            classes.push('bg-red-100', 'text-red-800');
        }
        if (severity === 'warning') {
            classes.push('bg-orange-100', 'text-orange-800');
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
            case ResultStatus.Finalizing:
                return 'info';
            case ResultStatus.Locked:
                return 'surface';
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
                return 'Esperando';
            case ResultStatus.WorkInProgress:
                return 'Calculando';
            case ResultStatus.Finalizing:
                return 'Finalizando';
            case ResultStatus.Locked:
                return 'Final';
            case ResultStatus.Approved:
                return 'OK';
            case ResultStatus.Failed:
                return 'Falló';
        }
    }

    get icon(): string | undefined {
        switch (this.resultStatus) {
            case ResultStatus.Unknown:
            case ResultStatus.NotApply:
            case ResultStatus.Pending:
            case ResultStatus.Finalizing:
                return undefined;
            case ResultStatus.Locked:
                return 'pi pi-lock';
            case ResultStatus.Approved:
                return 'pi pi-check';
            case ResultStatus.Failed:
                return 'pi pi-times';
        }
    }
}
