export interface MeterConstant {
  id: number;
  name: string;
}

export enum MeterConstantEnum {
  Active = 0,
  Reactive = 1,
}

export enum MeterConstantUnitEnum {
  whImp = 'wh/imp',
  impKwh = 'imp/kwh',
  varhImp = 'varh/imp',
  impKvarh = 'imp/kvarh',
}

export enum ActiveConstantUnitEnum {
  impKwh = 1,
  whImp = 2,
}

export enum ReactiveConstantUnitEnum {
  impKvarh = 1,
  varhImp = 2,
}

export const MeterConstants: MeterConstant[] = [
  {
    id: MeterConstantEnum.Active,
    name: 'Activa',
  },
  {
    id: MeterConstantEnum.Reactive,
    name: 'Reactiva',
  },
];
