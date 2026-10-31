# Mockups · Productos (StockFX)

Propuestas de diseño para la pantalla de productos, hechas **aparte del código real** (`src/` no se tocó). Son estáticas y se pueden abrir sin build.

## Cómo verlas

Abrí [`productos.html`](productos.html) en el navegador (doble clic o arrastrarlo a una pestaña). Arriba hay pestañas para cambiar entre las propuestas:

- **A · Tabla limpia**
- **B · Stock primero**
- **C · Cards**
- **D · Master-detail**
- **E · Híbrida A + B** (la que abre por defecto)

Redimensioná la ventana (o abrí las DevTools en modo responsive) para ver el comportamiento mobile. También se puede fijar una propuesta por URL:

```
productos.html?variant=v3
```

La barra de pestañas se oculta con `?clean=1` (es lo que usan las capturas).

## Capturas

En [`shots/`](shots/) están las capturas de escritorio (1440 px) y mobile (390 px), y una lámina comparativa por propuesta:

- [`shots/board-v1.png`](shots/board-v1.png)
- [`shots/board-v2.png`](shots/board-v2.png)
- [`shots/board-v3.png`](shots/board-v3.png)
- [`shots/board-v4.png`](shots/board-v4.png)
- [`shots/board-v5.png`](shots/board-v5.png)
- [`shots/v5-inactivos.png`](shots/v5-inactivos.png) (filtro Inactivos)
- [`shots/v5-sort-stock.png`](shots/v5-sort-stock.png) (orden mayor a menor)

## Comparativa rápida

| | Densidad | Mobile | Uso del color | A favor | En contra |
|---|---|---|---|---|---|
| **A · Tabla limpia** | Alta | Tabla → cards | Solo estado (verde/ámbar/rojo) | Lectura rápida, escala a 1.400+ productos, color no compite | Menos “visual”, depende de imágenes/tiles |
| **B · Stock primero** | Alta | Tabla → cards con barra | Estado + barras de nivel | Hace obvio qué reponer; ideal para stock | Más ruido visual, columna de stock más ancha |
| **C · Cards** | Baja | 1–2 columnas | Color por categoría en la portada | Se siente moderno y cómodo en mobile | Poco eficiente para catálogos grandes; difícil comparar precios/stock |
| **D · Master-detail** | Media | Lista → detalle full screen | Neutro + selección azul | Excelente para editar/gestionar sin cambiar de pantalla | No sirve para comparar varios productos a la vez |
| **E · Híbrida A + B** | Alta | Tabla → cards con barra | Activo/inactivo + barra de nivel | Junta lo mejor de A y B: sigue siendo rápida y muestra el nivel de un vistazo | Más columnas (costo/venta); tabla solo en pantallas anchas |

## La propuesta elegida: E · Híbrida A + B

Es la que quedó como **default** en la página: la tabla limpia de A, con la barra de nivel de stock de B dentro de la columna “Stock” (actual / máximo y una marca en el mínimo), sin foto de producto y con las columnas de costo y venta. El **Estado** es únicamente **Activo / Inactivo**, arriba hay un filtro con **Activos** por defecto (también Inactivos y Ambos) y un selector de orden. El color queda con un rol claro:

1. **Azul de marca** → navegación, botones primarios, selección.
2. **Verde → Activo; gris → Inactivo** en la columna Estado.
3. **Verde / ámbar / rojo en la barra** → nivel de stock (OK / Reponer / Crítico), respaldado por el punto, la etiqueta, los números y el mínimo.
4. **Colores por categoría** → solo en C, que es la propuesta de catálogo visual.

## Campos del esquema en la tabla

La E usa los campos reales de `producto`:

- `codigo` → columna **Código**.
- `nombre` + `descripcion` → celda de producto.
- `id_categoria` → **Categoría** (si es null, muestra “Sin categoría”).
- `precio_costo` / `precio_venta` → **Costo** y **Venta**.
- `stock_actual` / `stock_minimo` / `stock_maximo` → barra, “actual / máximo”, “mín.” y semáforo.
- `activo` → chip **Activo / Inactivo** y filtro de estado.
- `id_producto` no se muestra (es interno).

No hay miniatura: es una pantalla de trabajo, no un catálogo.

## Semáforo de stock

El color va en la celda **Stock**, no en Estado (que es solo activo/inactivo). La barra se colorea y al lado del mínimo aparece un punto + etiqueta:

- **Sin stock**: 0 unidades → rojo.
- **Crítico**: menos del 50% del mínimo → rojo.
- **Reponer**: entre 50% y 100% del mínimo → ámbar.
- **OK**: más del 100% del mínimo → verde.

La barra sigue mostrando `actual / máximo`; el semáforo mide urgencia contra el mínimo. Si el mínimo es 0, cualquier stock mayor a 0 se considera OK. Los umbrales están en constantes (`STOCK_CRITICAL_RATIO = 0.5`, `STOCK_OK_RATIO = 1`) para ajustarlos fácil (por ejemplo 0.7 y 1.2).

## Orden por stock

El dropdown de la toolbar sirve para **ordenar** la lista, no para filtrar por estado de stock:

- **Ordenar: recientes** (default).
- **Stock: mayor a menor**.
- **Stock: menor a mayor**.
- Nombre A–Z.
- Precio: mayor a menor.

El orden por stock usa `stock_actual` absoluto; los empates se resuelven por nombre. No hay un filtro por OK/Reponer/Crítico: el semáforo es visual. Si preferís “más urgente primero”, se puede agregar un orden por `stock / mínimo`.

La referencia original usa header oscuro + acento bordó. Eso pesa mucho y compite con los colores de estado; además el bordó no pertenece a la paleta de StockFX (azul). Por eso todas las propuestas usan header claro y dejan el color para la información, no para la estructura.

## Decisiones de responsive

- **E > 1280 px**: tabla completa.
- **E ≤ 1280 px**: cards en 2 columnas; **≤ 560 px**: 1 columna.
- **< 900 px**: la sidebar pasa a topbar con menú, las acciones del header se apilan y la paginación se reemplaza por “Cargar más”.
- **< 560 px**: filtros compactos y contador de resultados ajustado.
- Objetivos táctiles de ~40 px y texto de 10–13 px en mobile.

## Preguntas para iterar

1. En E, ¿mostramos `42 un. / 60` o directamente solo el número actual y la barra?
2. ¿Los umbrales 50% / 100% del mínimo te sirven, o preferís 70% / 120%? ¿Rojo para todo lo que esté bajo el mínimo?
3. ¿Costo y Venta van en columnas separadas o preferís solo Venta (con el costo en el detalle)?
4. ¿El default de **Activos** está bien, o preferís arrancar en Ambos?
5. ¿Confirmás que la E no lleva miniatura y que C queda como alternativa de catálogo?
6. ¿El orden por stock va por unidades absolutas o por `stock / mínimo` (“más urgente primero”)? ¿Querés que el default sea mayor stock en vez de recientes?
7. En la tabla, ¿acciones **ver / editar / menú** o editar directo?
8. ¿Paginación clásica o scroll infinito / cargar más?

## Notas

- Datos de ejemplo: 12 productos; los totales (1.420) son ficticios.
- La lámina de E está con el default **Activos**; en [`shots/v5-inactivos.png`](shots/v5-inactivos.png) se ve el filtro Inactivos y el chip gris, y en [`shots/v5-sort-stock.png`](shots/v5-sort-stock.png) el orden por stock mayor a menor. El nivel de stock se muestra con barra + punto/etiqueta; el Estado es solo activo/inactivo.
- Las miniaturas de C son **tiles con iniciales** (placeholder); E no usa imagen.
- Tipografía: Inter local en [`fonts/`](fonts/), así que no depende de internet.
- Los mockups son estáticos y **no forman parte del build** de la app.
