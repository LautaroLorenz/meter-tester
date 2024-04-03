import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-pdf-page',
  templateUrl: './pdf-page.component.html',
  styleUrls: ['./pdf-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPageComponent {
  @ViewChild('container') elementRef!: ElementRef<HTMLDivElement>;

  get html(): HTMLDivElement {
    return this.elementRef.nativeElement;
  }
}
