import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockUiComponent {
  @Input() blocked!: boolean;
}
