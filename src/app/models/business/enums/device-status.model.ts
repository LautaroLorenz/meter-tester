export enum DeviceStatus {
  Unknown = 'Unknown', // aún sin revisar
  StopInProgress = 'StopInProgress', // se encola para envio un comando stop
  Connected = 'Connected', // responde ack
  Working = 'Working', // reportando
  Error = 'Error', // ocurrió un error (timeout o respuesta con error)
}
