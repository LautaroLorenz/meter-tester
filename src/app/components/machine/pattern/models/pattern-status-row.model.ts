export interface PatternStatusRow {
    metric: string;
    l1: number | undefined;
    l2: number | undefined;
    l3: number | undefined;
    unit: string;
    decimals: number; // decimales a mostrar
    // Propiedades opcionales para mostrar letras después de los valores (ej: L, C para factor de potencia)
    l1Letter?: string;
    l2Letter?: string;
    l3Letter?: string;
}
