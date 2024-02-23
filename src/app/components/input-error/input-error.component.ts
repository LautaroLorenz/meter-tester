import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  templateUrl: './input-error.component.html',
  styleUrls: ['./input-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputErrorComponent {
  @Input() invalid!: boolean | undefined;
  @Input() dirty!: boolean | undefined;
  @Input() errors: ValidationErrors | null | undefined = null;

  hasError(key: string): boolean {
    if (!this.errors) {
      return false;
    }
    return !!this.errors[key];
  }
}
