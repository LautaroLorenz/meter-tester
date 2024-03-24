import {
  CommandRefreshType,
  VMDelayTypes,
  VMResponseTypes,
} from '../enums/virtual-machine-config.model';

export const VMResponseTypesConstant = [
  {
    value: VMResponseTypes.Automatic,
    label: 'Automática',
    helpText:
      'Apenas llega un comando, se envía la respuesta, según el mapeo de comandos',
  },
  {
    value: VMResponseTypes.Manual,
    label: 'Manual',
    helpText: 'La respuesta se envía al presionar en enviar',
  },
];

export const VMDelayTypesConstant = [
  {
    value: VMDelayTypes.Off,
    label: 'Sin delay',
    helpText: 'Responder en cuanto sea posible',
  },
  {
    value: VMDelayTypes.Fixed,
    label: 'Valor fijo',
    helpText: 'Responder luego de un delay fijo',
  },
  {
    value: VMDelayTypes.Range,
    label: 'Rango aletaorio',
    helpText:
      'Responder luego de un delay aleatorio entre un rango mínimo y máximo',
  },
];

export const VMCommandRefreshTypeConstant = [
  {
    value: CommandRefreshType.Automatic,
    label: 'Automático',
    helpText: 'Luego de responder los valores se refrescan',
  },
  {
    value: CommandRefreshType.Manual,
    label: 'Manual',
    helpText: 'Los valores cambian al presionar en refrescar',
  },
];
