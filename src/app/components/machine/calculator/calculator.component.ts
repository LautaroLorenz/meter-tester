import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import {
  Observable,
  Subject,
  Subscription,
  forkJoin,
  interval,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Stand } from '../../../models/business/interafces/stand.model';
import { DatabaseService } from '../../../services/database.service';
import {
  Meter,
  MeterDbTableContext,
} from '../../../models/business/database/meter.model';
import { RelationsManager } from '../../../models/core/relations-manager.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';
import { MeterConstantDirector } from '../../../models/business/class/meter-constant.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent
  extends MachineDeviceComponent
  implements OnInit
{
  override readonly device = Devices.CAL;

  private meters!: Meter[];

  private resultsLoopSubscription!: Subscription;
  private readonly stopResultsLoop$ = new Subject<void>();
  private readonly dbServiceMeters = inject(DatabaseService<Meter>);

  ngOnInit(): void {
    this.requestToolsTables();
  }

  runTest(): void {
    console.log('run test');
    // this.start$().subscribe((response) => console.log('start', response));
    // this.stop$().subscribe((response) => console.log('stop', response));
    // this.start$()
    //   .pipe(
    //     tap((response) => console.log('start', response)),
    //     switchMap(() => this.stop$())
    //   )
    //   .subscribe((response) => console.log('stop', response));

    // TODO resolver la manera para hacer loops
    // let counter = 1;
    // interval(500)
    //   .pipe(
    //     takeUntil(this.deviceError),
    //     takeUntil(this.onDestroy),
    //     switchMap(() => this.results$()),
    //     map(() => console.log(`counter: ${counter++}`))
    //   )
    //   .subscribe((response) => console.log('interval', response));
    forkJoin({
      comando1: this.start$(),
      comando2: this.stop$(),
      comando3: this.results$(),
    }).subscribe((response) => console.log(response));
  }

  results$(): Observable<string> {
    return this.write$(this.buildCommand(SoftwareCalculatorCommands.RESULTS));
  }

  start$(): Observable<string> {
    return this.write$(
      this.buildCommand(SoftwareCalculatorCommands.START_VACUUM)
    );
  }

  stop$(): Observable<string> {
    return this.write$(this.buildCommand(SoftwareCalculatorCommands.STOP));
  }

  // stop$(): Observable<string> {
  //   const from = Devices.STW;
  //   const to = this.device;
  //   const command = CommandDirector.build(
  //     from,
  //     to,
  //     SoftwareCalculatorCommands.STOP
  //   );
  //   return this.write$(command).pipe(
  //     tap(() => this.deviceStatus$.next(DeviceStatus.Connected)),
  //     tap(() => this.stopResultsLoop())
  //   );
  // }

  // start$(
  //   commandType: SoftwareCalculatorCommands,
  //   preparationStepStands: Stand[],
  //   stepMeterConstant: MeterConstantEnum
  // ): Observable<string> {
  //   const from = Devices.STW;
  //   const to = this.device;

  //   const stands: string[] = preparationStepStands.map(
  //     (stand, index) =>
  //       `PS${this.standIndex(index)}${this.standConstant(
  //         stand,
  //         stepMeterConstant
  //       )}`
  //   );
  //   const command = CommandDirector.build(from, to, commandType, ...stands);

  //   return this.write$(command).pipe(
  //     tap(() => this.deviceStatus$.next(DeviceStatus.Working)),
  //     tap(() => this.stopResultsLoop()),
  //     tap(() => this.startResultsLoop())
  //   );
  // }

  // TODO con esta logica, se puede pedir resultados y hacer stop al mismo componente (el calculador)
  // TODO lo buscado es que a un mismo device no se le pueda enviar un nuevo comando, si se le envio uno anterior

  // private startResultsLoop(): void {
  //   // TODO consulta resultados, refresca la interface y consulta resultados nuevamente
  //   // Emite por output los resultados
  //   // En el START inicia
  //   // En el STOP se detiene
  //   const from = Devices.STW;
  //   const to = this.device;
  //   const fakeCommand = CommandDirector.build(
  //     from,
  //     to,
  //     SoftwareCalculatorCommands.RESULTS
  //   );

  //   console.log('start');
  //   this.resultsLoopSubscription = interval(250) // Intervalo de tiempo entre solicitudes (en milisegundos)
  //     .pipe(
  //       tap(() => console.log('tick request')),
  //       concatMap(() => this.write$(fakeCommand)), // Realizar solicitud HTTP
  //       tap(() => console.log('tick request-procesed')),
  //       takeUntil(this.onDestroy),
  //       takeUntil(this.deviceStop),
  //       takeUntil(this.stopResultsLoop$)
  //     )
  //     .subscribe(() => console.log('tick response'));
  // }

  // private stopResultsLoop(): void {
  //   this.stopResultsLoop$.next();
  //   if (this.resultsLoopSubscription) {
  //     this.resultsLoopSubscription.unsubscribe();
  //   }
  // }

  private standIndex(index: number) {
    return (index + 1).toString().padStart(2, '0');
  }

  private standConstant(
    stand: Stand,
    stepMeterConstant: MeterConstantEnum
  ): string {
    const offStandConstant = 'xxxxx';
    if (!stand.isActive) {
      return offStandConstant;
    }
    const meter = this.meters.find((meter) => meter.id === stand.meterId);
    if (!meter) {
      return offStandConstant;
    }
    const meterConstant = MeterConstantDirector.get(meter, stepMeterConstant);
    if (!meterConstant) {
      return offStandConstant;
    }
    return meterConstant.toString().padStart(offStandConstant.length, '0');
  }

  private requestToolsTables(): void {
    // Medidores
    this.dbServiceMeters
      .getTableReply$(MeterDbTableContext.tableName)
      .pipe(
        take(1),
        map((response) => {
          const { foreignTables } = MeterDbTableContext;
          return RelationsManager.mergeRelationsIntoRows<Meter>(
            response.rows,
            response.relations,
            foreignTables
          );
        }),
        tap((meters) => (this.meters = meters))
      )
      .subscribe();
    this.dbServiceMeters.getTable(MeterDbTableContext.tableName, {
      relations: MeterDbTableContext.foreignTables,
    });
  }
}
