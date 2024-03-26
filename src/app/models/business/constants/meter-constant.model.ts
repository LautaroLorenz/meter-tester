export interface MeterConstant {
  id: number;
  name: string;
}

export enum MeterConstantEnum {
  Active = 0,
  Reactive = 1,
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
