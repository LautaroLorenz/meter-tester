export enum BarcodeScannerFromType {
    fromText = 'fromText',
    fromStart = 'fromStart',
    fromFixedIndex = 'fromFixedIndex'
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
export interface BarcodeScannerFromFixedIndex {
    type: BarcodeScannerFromType.fromFixedIndex;
    fixedIndex: number;
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
    from: BarcodeScannerFromText | BarcodeScannerFromStart | BarcodeScannerFromFixedIndex;
    to: BarcodeScannerToText | BarcodeScannerToEnd | BarcodeScannerToFixedLength;
}
