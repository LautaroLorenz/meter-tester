import {
  CommandRefreshType,
  VMDelayTypes,
  VMResponseTypes,
} from '../interafces/virtual-machine.model';

export const VMResponseTypesConstant = [
  {
    value: VMResponseTypes.Automatic,
    label: 'Automática',
    helpText: 'Apenas llega un comando, se envía la respuesta',
  },
  {
    value: VMResponseTypes.Manual,
    label: 'Manual',
    helpText: 'La respuesta se envía al precionar en enviar',
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
    value: CommandRefreshType.Keep,
    label: 'Mantener',
    helpText: 'Luego de responder los valores se mantienen',
  },
  {
    value: CommandRefreshType.Refresh,
    label: 'Refrescar',
    helpText: 'Luego de responder los valores cambian',
  },
];
