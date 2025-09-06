export interface PatternStatusRow {
    metric: string;
    l1: number | undefined;
    l2: number | undefined;
    l3: number | undefined;
    unit: string;
    decimals: number; // decimales a mostrar
}
