import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { AbstractFormGroup } from '../../models/core/abstract-form-group.model';
import { Stand } from '../../models/business/interafces/stand.model';

@Component({
    selector: 'app-copy-stand-dialog',
    templateUrl: './copy-stand-dialog.component.html',
    styleUrls: ['./copy-stand-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyStandDialogComponent implements OnChanges {
    @Input() showDialog = false;
    @Input() sourceIndex!: number;
    @Input() controls: AbstractFormGroup<Stand>[] = [];
    @Output() closeDialog = new EventEmitter<void>();

    selectedIndexes!: Set<number>;
    sourceForm!: AbstractFormGroup<Stand>;
    targets!: { index: number; name: string; isActive: boolean }[];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.showDialog && changes.showDialog.currentValue === true) {
            this.selectedIndexes = new Set<number>();
            this.sourceForm = this.controls.at(this.sourceIndex) as AbstractFormGroup<Stand>;
            this.targets = this.controls.map((c, i) => ({
                index: i,
                name: c.get('name')?.value,
                isActive: c.get('isActive')?.value && i !== this.sourceIndex
            })) as { index: number; name: string; isActive: boolean }[];
            this.toggle(this.sourceIndex);
        }
    }

    selectAll(): void {
        this.targets.forEach((target) => {
            if (!this.selectedIndexes.has(target.index) && target.isActive) {
                this.toggle(target.index);
            }
        });
    }

    toggle(index: number): void {
        if (this.selectedIndexes.has(index)) {
            this.selectedIndexes.delete(index);
        } else {
            this.selectedIndexes.add(index);
        }
    }

    confirm(): void {
        const valuesToCopy = this.sourceForm.getRawValue();
        delete valuesToCopy.name;
        this.selectedIndexes.forEach((selectedIndex) => {
            if (this.sourceIndex !== selectedIndex) {
                this.controls.at(selectedIndex)?.patchValue(valuesToCopy);
            }
        });
        this.close();
    }

    close(): void {
        this.closeDialog.emit();
    }
}
