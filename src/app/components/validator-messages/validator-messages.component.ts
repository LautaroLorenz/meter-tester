/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-validator-messages',
  templateUrl: './validator-messages.component.html',
  styleUrls: ['./validator-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatorMessagesComponent {
  @Input() errors: ValidationErrors = {};

  get errorsArray(): { code: string; message: string }[] {
    return Object.keys(this.errors).map((key) => this.errors[key]);
  }

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }
}
