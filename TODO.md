NICE TO HAVE
- Validar al crear el template que los pasos tengan los formularios válidos, con un feedback visual como la row en rojo.
- implementar drag y drop para ordenar los pasos
- Agregar una explicación de lo que hace cada Paso en el botón de Agregar paso.
- Verificación y preparación podrian ser opcionales.
- El componente de paso activo, podria tener una opción collapsed (sin textos y con tooltips)

CORE
- Contraseña en la base de datos para que no se pueda acceder

FEATURES:
- login
  - ABM de usuarios
  - Roles de usuarios con permisos.
- backup
- estadísticas
- ejecución
- historial

EJECUCIÓN:
- crear las interfaces para Results
- Pasos:
  - Verificación de parámetros
    - Poner un warning si hay stands activos sin data para el reporte
  - Ejecución:
    - Al momento de apagar los componentes de la maquina se puede usar BLOCK UI de primeng para bloquear la interface
  - Inidicar la endDate
  - Agregar al historial (indicar el ID de reporte).
  - Reporte