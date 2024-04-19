NICE TO HAVE
- Validar al crear el template que los pasos tengan los formularios válidos, con un feedback visual como la row en rojo.
- implementar drag y drop para ordenar los pasos
- Agregar una explicación de lo que hace cada Paso en el botón de Agregar paso.
- Verificación y preparación podrian ser opcionales.
- El componente de paso activo, podria tener una opción collapsed (sin textos y con tooltips)
- La creación del ensayo "app/essay.ts" podría ser código generico que haga eliminación/creación/edición sobre elementso de un array.

BUG
- en el seed de meters no usar valores aleatorios porque se rompe el preparation step del template

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
- Pasos:
  - Verificación de parámetros
    - Poner un warning si hay stands activos sin data para el reporte
  - Ejecución:
    - Al momento de apagar los componentes de la maquina se puede usar BLOCK UI de primeng para bloquear la interface
  - Agregar al historial (indicar el ID de reporte).
  - Reporte

CREACÓN
- Poner textos de ayuda de los pasos, mas visibles en lugar de helps en los inputs.
- Validar si el nombre de ensayo ya está en uso.
- Si un puesto esta activo los campos son requeridos.

NICO
- Definición de comandos:
  - renombre de PCS a STW
  - cantidad de puestos que se envian en el comando
  - en el PatternResponseCommands.STATUS ¿van las xxxxx antes de los números?
  - ¿completar con 'x' cuando el puesto esta apagado?
  - en el patrón revisar que esten ok los valores que se muestran en la tabla, en cuanto a los decimales.