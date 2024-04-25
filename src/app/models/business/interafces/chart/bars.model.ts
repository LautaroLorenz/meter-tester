export interface BC_Dataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderRadius: number;
}

export interface BarChartData {
  datasets: BC_Dataset[];
  labels: string[];
}
