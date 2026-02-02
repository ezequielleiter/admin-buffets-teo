# Buffet Presentación

Esta es la versión de presentación del menú del buffet, diseñada específicamente para ser mostrada en pantallas grandes (TV, monitores, etc.) para clientes.

## Características

### Diseño Atractivo
- **Diseño fullscreen**: Optimizado para pantallas grandes
- **Gradientes dinámicos**: Fondo animado con efectos visuales
- **Animaciones suaves**: Transiciones y efectos de aparición
- **Colores vibrantes**: Paleta de colores llamativa y moderna

### Funcionalidades Dinámicas
- **Rotación automática**: Las secciones cambian cada 15 segundos automáticamente
  - Menú → Promociones → Eventos → Menú (ciclo continuo)
- **Reloj en tiempo real**: Muestra hora y fecha actuales
- **Animaciones de entrada**: Los elementos aparecen con efectos visuales
- **Efectos hover**: Interacciones visuales al pasar el mouse

### Secciones

#### 1. Header Fijo
- Logo del buffet (si está disponible)
- Nombre del establecimiento
- Ubicación
- Reloj y fecha en tiempo real

#### 2. Menú de Productos
- Grid responsivo con productos disponibles
- Imágenes, nombres, descripciones y precios
- Animaciones de entrada escalonadas
- Efectos de brillo y escalado

#### 3. Promociones Especiales
- Destacado visual especial para promociones
- Efectos de brillo animados
- Badge de "PROMOCIÓN" llamativo
- Precios destacados

#### 4. Próximos Eventos
- Máximo 3 eventos próximos
- Imágenes de eventos
- Información de fecha y hora
- Iconos de redes sociales de artistas
- Animaciones de rebote en iconos

### Tecnología

#### Endpoints Utilizados
Utiliza exactamente los mismos endpoints que `buffet-menu`:
```
GET /api/admin-buffets/buffet-menu/${buffetId}
```

#### Estructura de Datos
- **Buffet**: Información básica, logo, ubicación, redes sociales
- **Productos**: Lista de productos con disponibilidad
- **Promociones**: Ofertas especiales
- **Eventos**: Eventos próximos ordenados por fecha

## Uso

### URL de Acceso
```
/buffet-presentacion/[buffetId]
```

### Ejemplo
Para el buffet con ID `64a1b2c3d4e5f6789012345`, accede a:
```
/buffet-presentacion/64a1b2c3d4e5f6789012345
```

### Configuración Recomendada
- **Pantalla**: TV o monitor grande (32" o más)
- **Resolución**: 1920x1080 o superior
- **Navegador**: Chrome, Firefox, Safari en modo fullscreen
- **Conexión**: Internet estable para cargar imágenes

### Estados de la Aplicación

#### Carga
- Spinner animado con gradiente
- Mensaje de "Cargando presentación..."

#### Error
- Pantalla de error con gradiente rojo
- Mensaje claro del problema

#### Sin Datos
- Las secciones vacías no se muestran
- La rotación omite secciones sin contenido

## Personalización

### Colores
Los colores están definidos en el componente y pueden modificarse:
- **Fondo**: Gradiente azul-índigo-slate
- **Acentos**: Amarillo-naranja para precios
- **Secciones**: Verde-azul para menú, púrpura-rosa para eventos, naranja-rojo para promociones

### Timing
- **Rotación de secciones**: 15 segundos (configurable)
- **Reloj**: Actualización cada segundo
- **Animaciones**: Entre 0.5s y 1s de duración

### Responsive
- **Móvil**: 1 columna
- **Tablet**: 2-3 columnas
- **Desktop**: 3-4 columnas
- **TV**: Hasta 4 columnas optimizadas

## Diferencias con buffet-menu

| Aspecto | buffet-menu | buffet-presentacion |
|---------|-------------|-------------------|
| **Propósito** | Navegación manual | Presentación automática |
| **Diseño** | Limpio y funcional | Atractivo y dinámico |
| **Interacción** | Click para ver eventos | Solo visual |
| **Layout** | Scrolleable | Fullscreen fijo |
| **Animaciones** | Mínimas | Extensivas |
| **Rotación** | Manual | Automática |
| **Público** | Usuarios móvil/web | Clientes en establecimiento |

## Mantenimiento

### Actualización de Datos
Los datos se actualizan automáticamente desde la misma API que `buffet-menu`, por lo que no requiere mantenimiento adicional.

### Rendimiento
- Las imágenes se optimizan automáticamente
- Las animaciones usan CSS para mejor rendimiento
- El componente se re-renderiza solo cuando cambian los datos