# Fuentes Monospace Offline

Este directorio contiene las fuentes monospace necesarias para garantizar una renderización consistente de las tablas y datos técnicos en todas las plataformas (Windows y Linux).

## Fuentes Incluidas

### JetBrains Mono (Principal)
- **Formato**: WOFF2 (optimizado para web)
- **Pesos**: 100-800 (Thin a ExtraBold)
- **Estilos**: Normal e Itálica
- **Uso**: Fuente principal para todos los componentes que requieren monospace

### Source Code Pro (Fallback)
- **Formato**: OTF (OpenType)
- **Pesos**: 200-900 (ExtraLight a Black)
- **Estilos**: Normal e Itálica
- **Uso**: Fuente de respaldo en caso de que JetBrains Mono no esté disponible

## Implementación

Las fuentes se cargan automáticamente a través del archivo `monospace-fonts.css` que está incluido en `styles.scss` global.

### Variable CSS
```css
--font-monospace: 'JetBrains Mono', 'Source Code Pro', 'Consolas', 'Monaco', 'Courier New', monospace;
```

### Clases Utilitarias
- `.font-mono`: Peso 500, tamaño 0.75rem
- `.font-mono-medium`: Peso 500, tamaño 0.75rem
- `.font-mono-regular`: Peso 400, tamaño 0.75rem
- `.font-mono-bold`: Peso 600, tamaño 0.75rem

## Componentes Actualizados

Los siguientes componentes ahora usan las fuentes offline:

1. **pattern-status**: Tablas de estado de patrones
2. **phase-table**: Tablas de fases de medición
3. **stands-result**: Resultados de stands de medición
4. **preparation-pdf-report**: Reportes PDF de preparación
5. **integration-test-pdf-report**: Reportes PDF de pruebas de integración
6. **stands-integration-values**: Valores de integración de stands
7. **command-history**: Historial de comandos de máquina virtual

## Beneficios

- ✅ **Consistencia**: Misma apariencia en Windows y Linux
- ✅ **Offline**: Funciona sin conexión a internet
- ✅ **Rendimiento**: Fuentes optimizadas (WOFF2)
- ✅ **Legibilidad**: Fuentes diseñadas específicamente para código y datos técnicos
- ✅ **Fallback**: Sistema de respaldo robusto

## Licencias

- **JetBrains Mono**: Licencia Open Font License (OFL)
- **Source Code Pro**: Licencia Open Font License (OFL)

Ambas fuentes son de código abierto y pueden usarse libremente en aplicaciones comerciales.
