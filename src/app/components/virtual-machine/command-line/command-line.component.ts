import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  CommandLine,
  CommandLineConfigTypes,
} from '../../../models/business/interafces/command-line.model';
import { CommandLineDirector } from '../../../models/business/class/command-line-director.model';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandLineComponent {
  @Input() commandLines!: CommandLine[];

  @Output() refresh = new EventEmitter<number>();
  @Output() send = new EventEmitter<number>();

  readonly columns = [
    {
      header: 'Comando',
      field: 'name',
    },
    {
      header: 'Valor',
      field: CommandLineDirector.getValue.bind(this),
    },
    {
      /**
       * Busca en el historial de comandos un regex que coincida con esta condición para saber si debe enviarse como respuesta
       */
      header: 'Condición de activación',
      field: (commandLine: CommandLine) => {
        if (!commandLine.enableConditions) {
          return 'Activo por default';
        }
        return commandLine.enableConditions.map(
          ({ pattern }) => `${pattern}<br/>`
        );
      },
    },
    {
      header: 'Configuración',
      field: (commandLine: CommandLine) => {
        if (!commandLine.config) {
          return 'Valor fijo';
        }
        const config = commandLine.config;
        switch (config.type) {
          case CommandLineConfigTypes.Incremental:
            return `
                Probabilidad de cambio: ${config.probabilityOfChange}%<br/>
                Incremento: ${config.incrementQuantity}
            `;
          case CommandLineConfigTypes.Random:
            return `
                Probabilidad de cambio: ${config.probabilityOfChange}%<br/>
                Min: ${config.minRandom}<br/>
                Max: ${config.maxRandom}
            `;
        }
      },
    },
  ];

  getColValue(
    commandLine: CommandLine,
    col: {
      header: string;
      field: keyof CommandLine | ((commandLine: CommandLine) => string);
    }
  ): string {
    if (typeof col.field === 'function') {
      return col.field(commandLine);
    }
    return commandLine[col.field] as string;
  }

  isValueRefresh(commandLine: CommandLine): boolean {
    return 'config' in commandLine;
  }
}
