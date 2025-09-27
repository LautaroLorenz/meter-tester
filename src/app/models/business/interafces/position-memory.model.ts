export interface PositionMemory {
    position: string;
    commandsReceived: string[];
    responsesSent: string[];
    ts02Counter: number;
    lastUpdate: Date;
    minWaitSeconds: number; // Tiempo mínimo de espera antes de poder actualizar aleatoriamente
    lastCommandTime: Date; // Momento del último comando procesado
}

export interface PositionMemoryMap {
    [position: string]: PositionMemory;
}
