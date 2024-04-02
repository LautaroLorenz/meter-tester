import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vm-pattern',
  templateUrl: './vm-pattern.component.html',
  styleUrls: ['./vm-pattern.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VmPatternComponent {

}
