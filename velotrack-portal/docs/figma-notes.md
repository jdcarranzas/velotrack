# Notas del diseño de Figma

Resumen de lo que el código exportado de Figma (React + Tailwind) define para el portal. El código no se copia tal cual: se reescribe con la arquitectura del proyecto (servicios, hooks, styled-jsx y tokens del tema). Los colores ya están en `src/utils/theme/theme.constants.ts`.

Pantallas recibidas: Dashboard, Captura en vivo, Sesiones (lista y nueva sesión) y Talento (tabla de patinadores, perfil y modal de reasignación). El código de Talento llegó cortado: falta el final de la tabla y la vista de equipos. Tampoco llegaron el layout (header y navegación) ni el archivo de datos (`data.ts`).

## Dominio que define el diseño

**Patinador:** nombre, documento, fecha de nacimiento, edad, teléfono, correo, categoría (`Infantil`, `Juvenil`, `Junior`, `Mayores`), equipo, sede, entrenador, estado (`Activo`, `Inactivo`, `Lesionado`) y última sesión. Se marca "Menor" si tiene menos de 18 años, y la tabla tiene el filtro "Solo menores".

**Equipos, sedes y entrenadores de ejemplo:** equipos Élite A, Élite B y Desarrollo; sedes Bogotá, Medellín y Cali; entrenadores Carlos Mendoza, Ana Jiménez y Luis Prada.

**Sesión:** fecha, tipo (`Entrenamiento`, `Competencia`), prueba (`300m`, `500m`, `1000m`, `1500m`), equipo, atletas participantes y estado de guardado (`Guardado`, `Pendiente`, `Error`). La prueba define el número de vueltas (300m → 4, 500m → 6, 1000m → 12, 1500m → 18).

**Captura en vivo:**

- Un reloj general con Iniciar y Finalizar, y una tarjeta por atleta con el botón "Vuelta".
- Cada vuelta guarda su tiempo y una velocidad calculada (distancia de la vuelta ÷ tiempo) y pasa de "enviando…" a "guardado".
- Cada tarjeta muestra V. salida, V. máx., mejor vuelta y recuperación (en **lpm**), y tiene un campo de observaciones.
- Al finalizar aparece "Finalizar y guardar".

**Dashboard:**

- KPIs con un subtexto: sesiones del mes ("↑ 3 vs mes anterior"), atletas activos ("de 8 en el equipo"), mejor vuelta (atleta y fecha) y velocidad máxima promedio (de la última sesión).
- Gráfica de evolución del tiempo por vuelta con un chip por atleta para mostrarlo u ocultarlo.
- Barras de velocidad máxima por atleta en la última sesión.
- Tabla "Top 5 mejores tiempos por vuelta" con tendencia y diferencia con el último registro.

**Perfil del patinador:** datos personales, tarjetas de estadísticas (mejor vuelta de la temporada, velocidad máxima registrada, sesiones en el mes y promedio de vuelta), tabla de últimas sesiones y botón "Reasignar equipo".

## Diferencias con el plan (a resolver en la fase 1)

1. **Reasignación con aprobación.** El modal pide equipo, sede y entrenador destino más un motivo obligatorio, y al confirmar dice "La solicitud será revisada por el coordinador de sede". Eso es un flujo de **solicitud y aprobación**, con un rol "coordinador de sede" que no está en el plan. El plan suponía una reasignación directa.
2. **Rangos que avisan pero no bloquean.** El diseño marca en rojo con ⚠ los valores fuera de rango (vuelta de 15,5 a 23 s, velocidad de salida de 30 a 60 km/h, velocidad máxima de 35 a 58 km/h y recuperación de 110 a 190 lpm), pero los guarda. El plan decía que un valor fuera de rango no se puede guardar (HU13).
3. **Recuperación** se mide en latidos por minuto (lpm). El plan suponía una escala de 1 a 10.
4. **Resistencia** no aparece en ninguna pantalla, aunque está en el alcance.
5. **Dos tiempos por vuelta.** El código de Figma simula el tiempo de vuelta con un número aleatorio. En el portal el tiempo saldrá del cronómetro real (diferencia entre dos toques de "Vuelta").
6. **Estado del atleta** (`Activo`, `Inactivo`, `Lesionado`) es distinto de "archivado". Hay que definir si un atleta inactivo o lesionado puede participar en una sesión (el diseño solo ofrece los activos).
7. **Categorías de edad.** Hay que confirmar si la categoría se calcula a partir de la fecha de nacimiento o se asigna a mano.
