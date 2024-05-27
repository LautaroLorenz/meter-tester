import { Steps } from '../enums/steps.model';
import { HelpText } from '../interafces/help-text.model';

export const HelpTextStepsMap: Record<number, HelpText> = {
  [Steps.BootTest]: {
    title: 'Para superar la prueba los medidores deben emitir cierta cantidad de impulsos entre un tiempo mínimo y un tiempo máximo.',
    message: 'Si el mínimo es cero no se utiliza. <br>Si los impulsos emiten igual o más cantidad del mínimo superan la prueba.'
  },
  [Steps.ContrastTest]: {
    title: '',
    message: ''
  },
  [Steps.Preparation]: {
    title: '',
    message: ''
  },
  [Steps.VacuumTest]: {
    title: 'En esta prueba, los medidores no deben emitir más impulsos de los permitidos durante el tiempo especificado. Si los impulsos exceden el máximo permitido, la prueba no se considerará superada.',
    message: ''
  },
};
