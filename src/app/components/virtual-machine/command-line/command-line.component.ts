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
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../models/core/table-column.model';

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

  readonly columns: TableColumn[] = [
    {
      header: 'Comando',
      field: 'name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      header: 'Valor',
      field: CommandLineDirector.getValue.bind(this),
      alignHorizontal: TC_AlignHorizontal.Text,
      customStyles: 'word-break: break-word; font-family: monospace;',
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
        return commandLine.enableConditions
          .map(({ pattern }) => `${pattern}`)
          .join('<br/>');
      },
      alignHorizontal: TC_AlignHorizontal.Text,
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
      alignHorizontal: TC_AlignHorizontal.Text,
    },
  ];

  isValueRefresh(commandLine: CommandLine): boolean {
    return 'config' in commandLine;
  }
}
