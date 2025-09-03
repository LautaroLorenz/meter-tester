import { Pipe, PipeTransform } from '@angular/core';
import { Phase } from '../../models/business/interafces/phase.model';

/**
 * @return MeterConstantEnum como 'value[unit]'
 */
@Pipe({
    name: 'phasesToCommand'
})
export class PhasesToCommandPipe implements PipeTransform {
    /**
     * recibe las las tres fases y las devuelve como bloques para un comando
     */
    transform(phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): string[] {
        return [
            this.formatU(phaseL1.voltage),
            this.formatU(phaseL2.voltage),
            this.formatU(phaseL3.voltage),
            this.formatI(phaseL1.current),
            this.formatI(phaseL2.current),
            this.formatI(phaseL3.current),
            this.formatPhi(phaseL1.anglePhi),
            this.formatPhi(phaseL2.anglePhi),
            this.formatPhi(phaseL3.anglePhi)
        ];
    }

    // formatear la tensión
    formatU = (voltage: number): string => {
        if (voltage === undefined || voltage === null || isNaN(voltage)) {
            return 'xxxx0000'; // valor por defecto
        }
        // Separar entero y decimal
        const [intPart, fracPart] = voltage.toFixed(1).split('.');
        // Entero con padding de 3 dígitos
        const intFormatted = intPart.padStart(3, '0');
        // Decimal (siempre un dígito)
        const fracFormatted = fracPart || '0';
        return `xxxx${intFormatted}${fracFormatted}`;
    };

    // formatear la corriente
    formatI = (current: number): string => {
        if (current === undefined || current === null || isNaN(current)) {
            return 'xx000000';
        }
        // Asegura 3 decimales con redondeo
        const [intPart, fracPart] = Number(current).toFixed(3).split('.');
        // Entero a 3 dígitos (si por algún motivo excede, toma los últimos 3)
        const intFormatted = intPart.padStart(3, '0').slice(-3);
        // Decimales ya vienen con 3 dígitos por toFixed(3)
        const fracFormatted = (fracPart ?? '').padEnd(3, '0').slice(0, 3);
        return `xx${intFormatted}${fracFormatted}`;
    };

    // formatear la fase
    formatPhi = (anglePhi: number): string => {
        if (anglePhi === undefined || anglePhi === null || isNaN(anglePhi)) {
            return 'xxx+0000';
        }
        // signo y magnitud (acotamos a 359.9 por seguridad)
        const sign = anglePhi >= 0 ? '+' : '-';
        const abs = Math.min(Math.abs(Number(anglePhi)), 359.9);
        // 3 enteros + 1 decimal, con padding
        const [intPart, fracPart] = abs.toFixed(1).split('.');
        const intFormatted = intPart.padStart(3, '0').slice(-3);
        const fracFormatted = (fracPart ?? '0').slice(0, 1).padEnd(1, '0');
        return `xxx${sign}${intFormatted}${fracFormatted}`;
    };
}
