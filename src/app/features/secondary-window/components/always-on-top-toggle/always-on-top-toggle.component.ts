import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-always-on-top-toggle',
    template: `
        <div class="flex align-items-center gap-2 always-on-top-control" *ngIf="showToggle">
            <label [for]="toggleId">{{ label }}</label>
            <p-inputSwitch
                [id]="toggleId"
                [ngModel]="alwaysOnTop"
                (ngModelChange)="onToggleChange($event)"
                [disabled]="disabled"
            >
            </p-inputSwitch>
        </div>
    `,
    styles: [
        `
            .always-on-top-control {
                .p-inputswitch {
                    margin-left: 0.5rem;
                }

                label {
                    font-size: 0.875rem;
                    color: var(--text-color-secondary);
                    margin-bottom: 0;
                }
            }
        `
    ]
})
export class AlwaysOnTopToggleComponent {
    @Input() alwaysOnTop = false;
    @Input() disabled = false;
    @Input() showToggle = true;
    @Input() label = 'Mantener siempre visible';
    @Input() toggleId = 'alwaysOnTop';

    @Output() alwaysOnTopChange = new EventEmitter<boolean>();

    onToggleChange(checked: boolean): void {
        this.alwaysOnTopChange.emit(checked);
    }
}
