import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-static-widget',
    templateUrl: './static-widget.component.html',
    styleUrls: ['./static-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticWidgetComponent {
    @Input() title!: string;
}
