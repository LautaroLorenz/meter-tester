import { ValidationErrors } from '@angular/forms';

export const concatErrorByCode = (code: ErrorCodes, errors: ValidationErrors): ValidationErrors => {
    return {
        ...errors,
        [code]: ErrorCodesMessage[code]
    };
};

export enum ErrorCodes {
    name = 'name',
    AtLeastOneStep = 'AtLeastOneStep',
    standIsActive = 'standIsActive',
    adjustStepParams = 'adjustStepParams',
    AtLeastOneStandActive = 'AtLeastOneStandActive'
}

const ErrorCodesMessage: Record<ErrorCodes, { code: string; message: string }> = {
    [ErrorCodes.name]: {
        code: 'Nombre',
        message: 'Debes ingresar un nombre para el ensayo'
    },
    [ErrorCodes.AtLeastOneStep]: {
        code: 'Al menos un paso',
        message: 'El ensayo debe contener al menos un paso'
    },
    [ErrorCodes.standIsActive]: {
        code: 'Puesto activo',
        message: 'Se deben completar los campos del puesto'
    },
    [ErrorCodes.adjustStepParams]: {
        code: 'Ajustar parámetros',
        message: 'Debes ajustar los parámetros de uno o más pasos'
    },
    [ErrorCodes.AtLeastOneStandActive]: {
        code: 'Al menos un puesto activo',
        message: 'Al menos un puesto debe estar activo'
    },
};
