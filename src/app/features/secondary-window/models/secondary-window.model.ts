import { SecondaryWindowService } from '../../../services/secondary-window.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecondaryWindowComponent implements OnInit {
    windowTitle = '';
    windowId: number | null = null;

    protected readonly secondaryWindowService: SecondaryWindowService = inject(SecondaryWindowService);
    protected readonly cd: ChangeDetectorRef = inject(ChangeDetectorRef);
    private readonly titleService: Title = inject(Title);

    ngOnInit(): void {
        this.titleService.setTitle(this.windowTitle);
        this.secondaryWindowService.onMainWindowMessage(this.onMainWindowMessage.bind(this));
        this.secondaryWindowService
            .setSecondaryWindowReady()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .then((id) => (this.windowId = id))
            .catch(() => {});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMainWindowMessage(...args: any[]): void {}
}
