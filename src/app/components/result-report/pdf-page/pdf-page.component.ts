import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pdf-page',
  templateUrl: './pdf-page.component.html',
  styleUrls: ['./pdf-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPageComponent {}
