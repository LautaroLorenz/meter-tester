import { CBVariableTypes } from '../enums/command-block-types.model';

export const CBVariableTypesConstant = [
  {
    value: CBVariableTypes.Incremental,
    label: 'Incremental',
    helpText: 'Valor cada vez más grande',
  },
  {
    value: CBVariableTypes.Random,
    label: 'Aleatorio',
    helpText: 'Nuevo valor entre un rango',
  },
];
