import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-help-text',
  templateUrl: './help-text.component.html',
  styleUrls: ['./help-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpTextComponent {
  @Input() title!: string;
  @Input() message!: string;
  visible = false;

}
