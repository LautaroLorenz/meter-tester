export enum BarcodeScannerFromType {
    fromText = 'fromText',
    fromStart = 'fromStart'
}

export enum BarcodeScannerToType {
    toText = 'toText',
    toEnd = 'toEnd',
    toFixedLength = 'toFixedLength'
}

export interface BarcodeScannerFromText {
    type: BarcodeScannerFromType.fromText;
    text: string;
}

export interface BarcodeScannerFromStart {
    type: BarcodeScannerFromType.fromStart;
}

export interface BarcodeScannerToText {
    type: BarcodeScannerToType.toText;
    text: string;
}

export interface BarcodeScannerToEnd {
    type: BarcodeScannerToType.toEnd;
}

export interface BarcodeScannerToFixedLength {
    type: BarcodeScannerToType.toFixedLength;
    fixedLength: number;
}

export type BarcodeScannerParams = {
    from: BarcodeScannerFromText | BarcodeScannerFromStart;
    to: BarcodeScannerToText | BarcodeScannerToEnd | BarcodeScannerToFixedLength;
}
