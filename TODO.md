MÓDULOS:
- estadísticas
  - revisar comentarios que dejé en report major step
- backup
- login
  - ABM de usuarios
  - Roles de usuarios con permisos.
- Base de datos
  - Contraseña en la base de datos para que no se pueda acceder
- ejecución
  - conexión con el USB PRODUCT_ID + VENDOR_ID.
  - validación de checksum.

ERRORES
- En la creación del ensayo, falta un warning que te avise si falta ingresar la información de un paso, la row podria tener algun efecto visual, por ejemplo sobre el botón de "ajustar parámetros" si el form está pristinte o algo asi.
- Durante la verificación de la preparación:
  - Si un puesto esta activo los campos son requeridos durante la verificación.
  - Al menos un puesto debe estar activo.
  

MEJORAS necesarias:
- descripciones de los pasos
  - Agregar una explicación de lo que hace cada Paso en el botón de Agregar paso.
  - Poner textos de ayuda de los pasos, mas visibles en lugar de helps en los inputs.
- Ejecución:
  - Al momento de apagar los componentes de la maquina se puede usar BLOCK UI de primeng para bloquear la interface.
    - revisar el método canDeactivate en TestRunComponent
  - separar el historial de comandos a una ventana a parte que se pueda abrir independientemente del simulador.
- Reporte
  - Agregar información faltante: nombre de ensayo, tiempos de ejecicón (start y end)
  - Acomodar los estilos de los parámetros de los steps, crear un componente para estandarizar, aplicar tambien en meter-detail.
- Estadisticas
  - Estands usados: en lugar de contar la cantidad de veces que se usa, se podria sumar tiempo de uso.
- Cuando falla un puesto en el calculador, la ejecución del paso no se detiene, hay que deternerla.

MEJORAS opcionales:
- Implementar drag y drop para ordenar los pasos
- Verificación y preparación podrian ser opcionales. si no hay preparación, no hay reporte.
- El componente que muestra el paso activo durante la ejecución, podria tener una opción collapsed (sin textos y con tooltips).
- La creación del ensayo "app/essay.ts" podría ser código generico que haga eliminación/creación/edición sobre elementso de un array.
- Mejorar como se muestran los reportes.
- Revisar los TODO de los test para machine-device.spec.ts
- en el método "setApprovedStatus" si todos los stands aprobaron se puede avanzar automaticamente al siguiente step.
- un log cuando hay un error con una operación en la base de datos.
- más filtros en el historial.
- poder elegir la cantidad de ítems por página (guardado en BBDD como una setting del usuario).
