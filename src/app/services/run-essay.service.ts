import { Injectable } from '@angular/core';
import { MajorSteps } from '../models/business/enums/major-steps.model';
import { StepStatus } from '../models/business/enums/step-status.model';
import { RunEssay, RunEssayForm } from '../models/business/interafces/run-essay.model';
import { MajorStepsDirector } from '../models/business/class/major-steps-director.model';
import { EssayStep } from '../models/business/interafces/essay-step.model';
import { StepsBuilder } from '../models/business/class/steps-form-array-builder.model';
import { FormArray, FormBuilder } from '@angular/forms';
import { AbstractFormGroup } from '../models/core/abstract-form-group.model';
import { EssayTemplateStep } from '../models/business/database/essay-template-step.model';
import { Observable, ReplaySubject, filter, map, take, tap } from 'rxjs';
import { StandResult } from '../models/business/interafces/stand-result.model';
import { IpcService } from './ipc.service';
import { PreparationStep } from '../models/business/interafces/steps/preparation-step.model';
import { ActiveStand } from '../models/business/interafces/active-stand.model';

@Injectable({
    providedIn: 'root'
})
export class RunEssayService {
    canDeactivate: (() => Observable<boolean>) | null | undefined;

    private _majorStepStatusMap$!: ReplaySubject<Record<MajorSteps, StepStatus>>;
    private _runEssay$!: ReplaySubject<RunEssay>;
    private essaySteps!: FormArray<AbstractFormGroup<EssayStep>>;
    private _runEssayForm!: RunEssayForm;

    constructor(
        private readonly fb: FormBuilder,
        private readonly ipcService: IpcService
    ) {
        this._majorStepStatusMap$ = new ReplaySubject(1);
        this._runEssay$ = new ReplaySubject(1);
    }

    get majorStepStatusMap$(): Observable<Record<MajorSteps, StepStatus>> {
        return this._majorStepStatusMap$.asObservable();
    }

    get verificationSteps$(): Observable<EssayStep[]> {
        return this.runEssay$.pipe(
            map(({ essaySteps }) => MajorStepsDirector.stepsByMajorStep(essaySteps, MajorSteps.Verification))
        );
    }

    get preparationStep$(): Observable<EssayStep> {
        return this.runEssay$.pipe(
            map(({ essaySteps }) => MajorStepsDirector.stepsByMajorStep(essaySteps, MajorSteps.Preparation)),
            map((essaySteps) => essaySteps[0])
        );
    }

    get executionSteps$(): Observable<EssayStep[]> {
        return this.runEssay$.pipe(
            map(({ essaySteps }) => MajorStepsDirector.stepsByMajorStep(essaySteps, MajorSteps.Execution))
        );
    }

    get currentStep$(): Observable<EssayStep | undefined> {
        return this.runEssay$.pipe(
            map(({ essaySteps }) => MajorStepsDirector.stepsByMajorStep(essaySteps, MajorSteps.Execution)),
            map((essaySteps) => essaySteps.find(({ executedStatus }) => executedStatus === StepStatus.Current)),
            filter((currentStep) => currentStep !== undefined)
        );
    }

    get runEssay$(): Observable<RunEssay> {
        return this._runEssay$.asObservable();
    }

    get runEssayForm(): RunEssayForm {
        return this._runEssayForm;
    }

    set runEssayForm(value: RunEssayForm) {
        this.essaySteps = value.get('essaySteps') as FormArray<AbstractFormGroup<EssayStep>>;
        this._runEssayForm = value;
        this._runEssayForm.valueChanges.subscribe((runEssay) => {
            this._runEssay$.next(runEssay as RunEssay);
        });
    }

    openVirtualMachine(): Promise<void> {
        return this.ipcService.invoke('open-virtual-machine');
    }

    closeVirtualMachine(): Promise<void> {
        return this.ipcService.invoke('close-virtual-machine');
    }

    openLogsHistory(): Promise<void> {
        return this.ipcService.invoke('open-command-history');
    }

    closeLogsHistory(): Promise<void> {
        return this.ipcService.invoke('close-command-history');
    }

    reset(): void {
        this._majorStepStatusMap$.next(MajorStepsDirector.getMajorStepStatusMap([]));
    }

    buildSteps(essayTemplateSteps: EssayTemplateStep[]): void {
        StepsBuilder.buildEssaySteps(
            this.fb,
            this.runEssayForm.get('essaySteps') as FormArray<AbstractFormGroup<EssayStep>>,
            essayTemplateSteps
        );

        this.nextMajorStep();
    }

    inferOptionalStepsProps(): void {
        // verificar si todos los steps tienen name y si no tienen asignarles uno.
        this.verificationSteps$
            .pipe(
                take(1),
                tap((verificationSteps) => {
                    verificationSteps.forEach((essayStep) => {
                        if (
                            'name' in essayStep.form_control_raw &&
                            !essayStep.form_control_raw.name &&
                            essayStep.foreign.step?.name
                        ) {
                            this.getEssayStep(essayStep.id)
                                .get('form_control_raw.name')
                                ?.setValue(essayStep.foreign.step.name);
                        }
                    });
                })
            )
            .subscribe();
    }

    getEssayStep(essayStepId: number): AbstractFormGroup<EssayStep> {
        const essayStepsRaw = this.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const stepIndex = essayStepsRaw?.findIndex(({ id }) => essayStepId === id);
        return this.essaySteps.at(stepIndex);
    }

    getStandResult<T extends StandResult = StandResult>(essayStepId: number, standIndex: number): AbstractFormGroup<T> {
        const essayStep = this.getEssayStep(essayStepId);
        return (essayStep.get('standResults') as FormArray).at(standIndex) as AbstractFormGroup<T>;
    }

    getActiveStands(preparationStep: PreparationStep): ActiveStand[] {
        return preparationStep.form_control_raw
            .map((stand, index) => ({ stand, index }))
            .filter(({ stand: { isActive } }) => isActive);
    }

    nextMajorStep(): void {
        this._majorStepStatusMap$.next(MajorStepsDirector.getMajorStepStatusMap(this.essaySteps.value as EssayStep[]));
    }
}
