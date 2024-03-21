export enum DeviceStatus {
  Unknown = 'Unknown', // aún sin revisar
  Connected = 'Connected', // responde ack al check
  Working = 'Working', // reportando
  Error = 'Error', // ocurrió un error (timeout o respuesta con error)
}
