const yearOfProduction = new Date().getFullYear();

export interface YearOfProductionConstant {
  id: number;
  label: number;
}

export const YearOfProductionConstants: YearOfProductionConstant[] = Array(60)
  .fill({})
  .map((_, index) => ({
    id: yearOfProduction - index,
    label: yearOfProduction - index,
  }));
