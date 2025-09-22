import { Pipe, PipeTransform } from '@angular/core';
import { Phase } from '../../models/business/interafces/phase.model';
import { CommandDirector } from '../../models/business/class/command-director.model';

@Pipe({
    name: 'phasesToCommand'
})
export class PhasesToCommandPipe implements PipeTransform {
    /**
     * Recibe las tres fases y las devuelve como bloques codificados para un comando al generador
     * Formato: [UR, US, UT, IR, IS, IT, PR, PS, PT]
     * - UR|US|UT: Tensión con punto fijo 1 decimal, 2 bytes, máx 6553.5V
     * - IR|IS|IT: Corriente con punto fijo 2 decimales, 2 bytes, máx 655.35A
     * - PR|PS|PT: Factor de potencia con punto fijo 2 decimales, 3 bytes (signo + valor + L/C)
     */
    transform(phaseL1: Phase, phaseL2: Phase, phaseL3: Phase): string[] {
        return [
            this.formatU(phaseL1.voltage),
            this.formatU(phaseL2.voltage),
            this.formatU(phaseL3.voltage),
            this.formatI(phaseL1.current),
            this.formatI(phaseL2.current),
            this.formatI(phaseL3.current),
            this.formatPowerFactor(phaseL1.powerFactor, phaseL1.powerFactorLetter),
            this.formatPowerFactor(phaseL2.powerFactor, phaseL2.powerFactorLetter),
            this.formatPowerFactor(phaseL3.powerFactor, phaseL3.powerFactorLetter)
        ];
    }

    // Tensión: 2 bytes, 1 decimal, máximo: 65535 (6553.5V)
    formatU = (voltage: number): string => {
        return CommandDirector.encodeCompactNumber(voltage, 2, 1);
    };

    // Corriente: 2 bytes, 2 decimales, máximo: 65535 (655.35A)
    formatI = (current: number): string => {
        return CommandDirector.encodeCompactNumber(current, 2, 2);
    };

    /*
     * Factor de potencia: 3 bytes, 2 decimales:
     * 1 byte: para el signo como latin1
     * 1 byte: para el valor entero entre: 0 y 1 (0 a 255)
     * 1 byte: para el tipo reactivo o inductivo: L o C como latin1
     */
    formatPowerFactor = (powerFactor: number, powerFactorLetter: string): string => {
        // Determinar el carácter reactivo (L o C) como latin1
        const reactiveChar = powerFactorLetter?.toUpperCase() === 'C' ? 'C' : 'L';

        // Determinar el signo como latin1 (' ' para positivo, '-' para negativo)
        const sign = powerFactor < 0 ? '-' : ' ';

        // Usar CommandDirector para el valor en punto fijo con 2 decimales
        const valueBytes = CommandDirector.encodeCompactNumber(Math.abs(powerFactor), 1, 2);

        // Retornar los 3 bytes por separado
        return `${sign}${valueBytes}${reactiveChar}`;
    };
}
