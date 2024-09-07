import { BarcodeScannerFromType, BarcodeScannerParams, BarcodeScannerToType } from "../interafces/barcode-scanner-params.model";

export class BarcodeScanner {
    static getSerialNumber(params: BarcodeScannerParams, serialNumber: string): { match: boolean, result: string } {
        if (!serialNumber) {
            return { match: false, result: '' };
        }
        let startIndex = 0;
        let endIndex = serialNumber.length;
        let matchStartFlag = false;
        let matchEndFlag = false;

        // Start index        
        if (params.from.type === BarcodeScannerFromType.fromStart) {
            startIndex = 0;
            matchStartFlag = true;
        }
        if (params.from.type === BarcodeScannerFromType.fromText && serialNumber.indexOf(params.from.text) > -1) {
            // si se encuentra el texto, cambia el start index
            startIndex = serialNumber.indexOf(params.from.text) + params.from.text.length;
            matchStartFlag = true;
        }

        // End index
        if (params.to.type === BarcodeScannerToType.toEnd) {
            endIndex = serialNumber.length;
            matchEndFlag = true;
        }
        if (params.to.type === BarcodeScannerToType.toText && serialNumber.indexOf(params.to.text) > -1) {
            // si se encuentra el texto, cambia el end index
            endIndex = serialNumber.indexOf(params.to.text);
            matchEndFlag = true;
        }
        if (params.to.type === BarcodeScannerToType.toFixedLength) {
            endIndex = startIndex + params.to.fixedLength;
            matchEndFlag = true;
        }

        if (matchStartFlag && matchEndFlag) {
            return { match: true, result: serialNumber.substring(startIndex, endIndex) };
        }

        return { match: false, result: serialNumber };
    }
}