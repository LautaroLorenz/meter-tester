import { BarcodeScannerParams, BarcodeScannerFromType, BarcodeScannerToType } from './../../../../models/business/interafces/barcode-scanner-params.model';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-barcode-scanner-params-form',
  templateUrl: './barcode-scanner-params-form.component.html',
  styleUrls: ['./barcode-scanner-params-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BarcodeScannerParamsFormComponent),
      multi: true
    }
  ]
})
export class BarcodeScannerParamsFormComponent implements ControlValueAccessor {
  readonly BarcodeScannerFromType = BarcodeScannerFromType;
  readonly BarcodeScannerToType = BarcodeScannerToType;

  value!: BarcodeScannerParams;

  fromOptions = [{
    type: BarcodeScannerFromType.fromStart,
    label: 'Desde el comienzo',
  },
  {
    type: BarcodeScannerFromType.fromText,
    label: 'Desde el texto',
  },
  {
    type: BarcodeScannerFromType.fromFixedIndex,
    label: 'Desde el indice',
  }];

  toOptions = [{
    type: BarcodeScannerToType.toEnd,
    label: 'Hasta el final',
  },
  {
    type: BarcodeScannerToType.toText,
    label: 'Hasta el texto',
  },
  {
    type: BarcodeScannerToType.toFixedLength,
    label: 'Largo fijo',
  }];

  onChange!: (value: BarcodeScannerParams | undefined) => void;
  onTouched!: (_: any) => void;

  writeValue(value: BarcodeScannerParams | undefined): void {
    if (!value && this.onChange) {
      this.onChange(this.value);
    }
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFromChange(): void {
    this.onChange(this.value);
  }

  onToChange(): void {
    this.onChange(this.value);
  }
}
