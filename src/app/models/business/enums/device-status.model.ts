export enum DeviceStatus {
  Unknown = 'Unknown', // aún no se envia un comando
  StopInProgress = 'StopInProgress', // se encola un comando stop
  Connected = 'Connected', // responde el stop
  StartInProgress = 'StartInProgress', // se encola un comando start
  Working = 'Working', // responde el start
  Error = 'Error', // error en la respuesta de un comando (o timeout)
}
