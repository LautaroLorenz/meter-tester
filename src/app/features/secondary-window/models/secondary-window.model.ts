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
    alwaysOnTop = false;
    showAlwaysOnTopToggle = true;

    protected readonly secondaryWindowService: SecondaryWindowService = inject(SecondaryWindowService);
    protected readonly cd: ChangeDetectorRef = inject(ChangeDetectorRef);
    private readonly titleService: Title = inject(Title);

    ngOnInit(): void {
        this.titleService.setTitle(this.windowTitle);
        this.secondaryWindowService.onMainWindowMessage(this.onMainWindowMessage.bind(this));
        this.secondaryWindowService
            .setSecondaryWindowReady()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .then((id) => {
                this.windowId = id;
                // Sincronizar el estado inicial de alwaysOnTop
                this.syncAlwaysOnTopState();
            })
            .catch(() => {});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMainWindowMessage(...args: any[]): void {}

    onAlwaysOnTopChange(event: { checked: boolean }): void {
        if (this.windowId) {
            const checked = event.checked;
            this.secondaryWindowService.setAlwaysOnTop(this.windowId, checked).catch(() => {
                // Revert the toggle if the operation failed
                this.alwaysOnTop = !checked;
                this.cd.detectChanges();
            });
        }
    }

    private syncAlwaysOnTopState(): void {
        if (this.windowId) {
            this.secondaryWindowService
                .getAlwaysOnTopState(this.windowId)
                .then((isAlwaysOnTop) => {
                    this.alwaysOnTop = isAlwaysOnTop;
                    this.cd.detectChanges();
                })
                .catch(() => {
                    // Si no se puede obtener el estado, mantener el valor por defecto
                });
        }
    }
}
