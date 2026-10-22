# TA05 · Promesas y timers controlados

## Objetivo

Evolucionar la aplicación de cálculo de edad para practicar los puntos 12 y
13 de la teoría:

- Promesas y asincronía.
- Timers controlados.

La evolución parte del trabajo anterior sobre spies y mocks. La solución debe
mantener los tests unitarios existentes y añadir nuevas comprobaciones sin
depender del tiempo real ni de peticiones externas.

## Punto de partida

La aplicación dispone de:

- `EdadService`, que calcula la edad.
- `HomePage`, que utiliza el servicio.
- Tests sobre el DOM, reglas de mayoría de edad, spies y mocks.

No se deben eliminar los tests actuales de
`src/app/home/home.page.spec.ts`.

## Fase 1 · Promesa resuelta

Añade al servicio un método:

```ts
cargarEdad(anyoNacimiento: number): Promise<number>
```

Debe devolver una promesa con la edad calculada. Añade tests que utilicen
`async`/`await` y `resolves`.

El test debe comprobar el resultado de la promesa, no solamente que el método
devuelve un objeto `Promise`.

## Fase 2 · Respuesta correcta y error

Añade al componente una operación asíncrona, por ejemplo:

```ts
comprobarEdadAsync(): Promise<void>
```

Debe:

1. Activar un estado de carga.
2. Solicitar la edad al servicio.
3. Mostrar el mensaje de mayoría o minoría de edad.
4. Desactivar el estado de carga.
5. Mostrar un error si la promesa se rechaza.

Los tests deben utilizar un mock del servicio con:

```ts
mockResolvedValue(...)
mockRejectedValue(...)
```

También deben comprobar que el servicio recibe el año introducido por la
persona usuaria.

## Fase 3 · Integración con la plantilla

La plantilla debe mostrar:

- `Calculando edad...` mientras la promesa está pendiente.
- El resultado cuando se resuelve correctamente.
- Un mensaje de error cuando se rechaza.

Cuando se modifique el estado del componente desde un test, se debe utilizar
`fixture.detectChanges()` antes de consultar el DOM.

## Fase 4 · Timer controlado

El resultado correcto debe desaparecer automáticamente después de 4000 ms.
La plantilla debe mostrar también una cuenta atrás para que se pueda observar
el efecto del timer mientras se utiliza la aplicación.

Si el callback del timer cambia una propiedad que se muestra en la plantilla y
Angular no actualiza el DOM automáticamente, se debe utilizar
`ChangeDetectorRef.markForCheck()`. Este método avisa a Angular de que el
componente debe revisarse; no sustituye a `fixture.detectChanges()` cuando el
test consulta el DOM.

Añade tests con:

```ts
vi.useFakeTimers();
vi.advanceTimersByTime(4000);
vi.useRealTimers();
```

Los tests deben verificar:

- A los 3999 ms, el mensaje todavía aparece.
- A los 4000 ms, el mensaje desaparece.
- No se espera tiempo real durante la ejecución de la suite.

La limpieza debe estar garantizada mediante `afterEach` o mediante una
limpieza equivalente del componente.

## Criterios de aceptación

- Todos los tests anteriores siguen pasando.
- Se utilizan `await`, `resolves` y `rejects`.
- Se utilizan `mockResolvedValue` y `mockRejectedValue`.
- Se utilizan timers falsos y se restauran con `useRealTimers`.
- Se diferencian `setTimeout` (una ejecución) y `setInterval` (ejecuciones
  repetidas).
- Se cancelan los timers en `ngOnDestroy()` para evitar que sobrevivan al
  componente.
- Se prueba el límite exacto de 4000 ms y el valor inmediatamente inferior.
- No se realizan peticiones HTTP reales.
- Los tests siguen la estructura preparar, actuar y comprobar.
- La suite se ejecuta con:

```bash
npm test
```

## Referencia teórica

Consultar los apartados 12 y 13 de `DI05_Teoria_v2.html`.
