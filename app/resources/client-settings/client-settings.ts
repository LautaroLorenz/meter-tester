export interface ClientSettings {
    version: string;
    companyName: string;
    brandDescription: string;
}

export const DEFAULT_CLIENT_SETTINGS: ClientSettings = {
    version: '1.0.0',
    companyName: 'EDET',
    brandDescription: 'Laboratorio de Medidores'
};
