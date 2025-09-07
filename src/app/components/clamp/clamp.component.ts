import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-clamp',
    templateUrl: './clamp.component.html',
    styleUrls: ['./clamp.component.scss']
})
export class ClampComponent {
    @Input() lines = 2;
}
