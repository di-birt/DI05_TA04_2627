import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './home.page';
import { EdadService } from './edad.service';

// describe agrupa las pruebas relacionadas con una unidad.
describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  // Se ejecuta antes de cada it para evitar que un test contamine a otro.
  beforeEach(() => {
    // TestBed crea la instancia como lo haria Angular en la aplicacion.
    // Aqui probamos el componente directamente, sin pulsar el boton del HTML.
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    // Sin esta llamada, los cambios del componente todavia no se reflejan en el DOM.
    // Los tests de este archivo no consultan el DOM, pero la plantilla queda preparada.
    fixture.detectChanges();
  });

  // it describe una sola expectativa de comportamiento.
  it('crea la página', () => {
    // expect inicia la afirmación y toBeTruthy comprueba que existe una instancia.
    expect(component).toBeTruthy();
  });

  // Estas pruebas consultan el DOM generado por la plantilla, no solo la clase TypeScript.
  describe('HTML renderizado', () => {
    it('muestra el título de la tarjeta', () => {
      // nativeElement representa el elemento raíz renderizado por Angular.
      // querySelector busca el primer elemento que coincide con el selector CSS.
      const titulo = fixture.nativeElement.querySelector('ion-card-title');

      // Primero comprobamos que el elemento existe para que el fallo sea claro.
      expect(titulo).not.toBeNull();
      // textContent contiene el texto visible del elemento y sus descendientes.
      expect(titulo.textContent).toContain('Comprobar mayoría de edad');
    });

    it('renderiza una tarjeta y un botón', () => {
      // querySelectorAll devuelve todos los elementos que coinciden con el selector.
      const tarjetas = fixture.nativeElement.querySelectorAll('ion-card');
      // En Ionic comprobamos el componente ion-button, que es el elemento de la plantilla.
      const boton = fixture.nativeElement.querySelector('ion-button');

      // La plantilla debe contener una única tarjeta.
      expect(tarjetas.length).toBe(1);
      // El botón debe existir y mostrar el texto que identifica su acción.
      expect(boton).not.toBeNull();
      expect(boton.textContent).toContain('Ejecutar comprobación');
    });

    it('no muestra el resultado antes de ejecutar la comprobación', () => {
      // @if no renderiza .result mientras resultado todavía sea una cadena vacía.
      expect(fixture.nativeElement.querySelector('.result')).toBeNull();
    });

    it('muestra el resultado de mayoría de edad y su atributo accesible', () => {
      // Modificamos el estado y ejecutamos la acción que usaría la plantilla.
      component.anyoNacimiento = 2000;
      component.comprobarEdad();
      // Sin detectChanges, el HTML todavía no reflejaría el nuevo resultado.
      fixture.detectChanges();

      const resultado = fixture.nativeElement.querySelector('.result');

      expect(resultado).not.toBeNull();
      // Comprobamos el texto que verá el usuario.
      expect(resultado.textContent).toContain('es mayor de edad.');
      // getAttribute permite verificar atributos HTML y requisitos de accesibilidad.
      expect(resultado.getAttribute('aria-live')).toBe('polite');
    });

    it('muestra el resultado de minoría de edad', () => {
      // Usamos una fecha relativa para que la prueba siga siendo válida cada año.
      component.anyoNacimiento = new Date().getFullYear() - 16;
      component.comprobarEdad();
      fixture.detectChanges();

      const resultado = fixture.nativeElement.querySelector('.result');

      expect(resultado).not.toBeNull();
      // El mismo elemento debe mostrar el mensaje alternativo para una persona menor.
      expect(resultado.textContent).toContain('es menor de edad.');
    });
  });

  describe('Comprobar si es mayor de edad -> mayorDeEdad', () => {
    it('rechaza edades menores de 18', () => {
      // En la aplicacion, este metodo se alcanzaria desde comprobarEdad().
      // En un test unitario lo llamamos directamente para aislar esta regla.
      expect(component.mayorDeEdad(17)).toBe(false);
    });

    it('acepta la edad límite de 18', () => {
      // Se prueba el límite exacto de la regla.
      expect(component.mayorDeEdad(18)).toBe(true);
    });

    it('acepta edades mayores de 18', () => {
      // Un valor superior confirma que la regla no acepta solo el límite.
      expect(component.mayorDeEdad(30)).toBe(true);
    });
  });

  describe('Calcular edad -> calcularEdad', () => {
    it('devuelve la edad actual a partir del año de nacimiento', () => {
      const edad = 25;
      const anyoActual = new Date().getFullYear();
      const anyoNacimiento = anyoActual - edad;

      expect(component.calcularEdad(anyoNacimiento)).toBe(25);
    });

    it('permite comprobar la mayoría de edad usando la edad calculada', () => {
      const anyoActual = new Date().getFullYear();
      const anyoNacimiento = anyoActual - 18;
      const edad = component.calcularEdad(anyoNacimiento);

      expect(edad).toBe(18);
      expect(component.mayorDeEdad(edad)).toBe(true);
    });
  });

  describe('Comprobar mayoría de edad por año -> esMayorDeEdadPorAño', () => {
    it('devuelve true cuando el año de nacimiento corresponde a una persona mayor de edad', () => {
      const edad = 18;
      const anyoActual = new Date().getFullYear();
      const anyoNacimiento = anyoActual - edad;

      // El método combina calcularEdad y mayorDeEdad internamente.
      expect(component.esMayorDeEdadPorAño(anyoNacimiento)).toBe(true);
    });

    it('usa spies para observar sus colaboraciones internas', () => {
      // spyOn conserva la implementacion real: solo registra las llamadas.
      const calcularEdadSpy = vi.spyOn(component, 'calcularEdad');
      const mayorDeEdadSpy = vi.spyOn(component, 'mayorDeEdad');
      const anyoNacimiento = new Date().getFullYear() - 20;

      // Se ejecuta la logica real de esMayorDeEdadPorAño(), no una simulacion.
      expect(component.esMayorDeEdadPorAño(anyoNacimiento)).toBe(true);
      // Ademas del resultado, comprobamos como colaboran los metodos internos.
      expect(calcularEdadSpy).toHaveBeenCalledWith(anyoNacimiento);
      expect(mayorDeEdadSpy).toHaveBeenCalledWith(20);
    });
  });
});

/* El flujo sería algo asi:
  1. El componente pide al servicio calcular la edad con 2000. ---> component.esMayorDeEdadPorAño(2000)
  2. El servicio simulado responde 42. ---> mockReturnValue(42)
  3. El componente pasa 42 a esMayorDeEdad().
  4. El servicio simulado responde true. ---> mockReturnValue(true)
  5. El componente devuelve true.
 */

describe('HomePage con un mock de EdadService', () => {
  it('permite controlar la respuesta de la dependencia', () => {
    // El mock reemplaza al servicio real para que el test controle sus respuestas.
    // vi.fn() crea funciones falsas que tambien permiten verificar sus llamadas.
    const edadServiceMock = {
      calcularEdad: vi.fn().mockReturnValue(42),
      esMayorDeEdad: vi.fn().mockReturnValue(true),
    };

    TestBed.configureTestingModule({
      imports: [HomePage],
      // Cuando HomePage pida EdadService mediante inject(), recibira este mock.
      providers: [{ provide: EdadService, useValue: edadServiceMock }],
    });

    const fixture = TestBed.createComponent(HomePage);
    const component = fixture.componentInstance;

    // El resultado depende de los valores del mock, no de la fecha actual.
    expect(component.esMayorDeEdadPorAño(2000)).toBe(true);
    // Verificamos que el componente haya usado correctamente la dependencia.
    expect(edadServiceMock.calcularEdad).toHaveBeenCalledWith(2000);
    expect(edadServiceMock.esMayorDeEdad).toHaveBeenCalledWith(42);
  });
});

describe('Promesas y timers controlados', () => {
  it('resuelve la edad con una promesa', async () => {
    // TODO - Vamos a hacer uso de un Timer falso

    // TODO - Hacemos uso del servicio EdadService

    // Creamos la variable anyoNacimiento
    const anyoNacimiento = new Date().getFullYear() - 25;

    // TODO - Creamos una variable para recibir la promesa que devuelve cargarEdad

    // TODO - Avanzamos el reloj simulado en lugar de esperar un segundo real.

    /* TODO - await hace que Vitest espere el resultado antes de cerrar el test.
     Espera que la promesa se resuelva y su valor sea 25*/

    // TODO - Restaurar el reloj real

  });

  it('muestra el resultado cuando la promesa se resuelve', async () => {
    /* TODO - Creamos un mock para edadService
     * cargarEdad devolverá siempre 20
     * esMayorDeEdad devolverá siempre true
     */

    // TODO - Añadir los providers necesarios
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [],
    });

    const fixture = TestBed.createComponent(HomePage);
    const component = fixture.componentInstance;
    component.anyoNacimiento = 2004;

    /* TODO - La promesa se resuelve sin esperar tiempo real.
     * Llamar al método comprobarEdadAsync, tener en cuenta la asincronía
     */

    // TODO - resultado contendrá "es mayor de edad"

    // TODO - Comprobaremos que cargarEdad se puede llamar con un parámetro 2004
    
    // TODO - cargando será false

  });

  it('muestra un error cuando la promesa se rechaza', async () => {
    /* TODO - Crear un Mock para EdadSErvice
     * cargarEdad controlaremos si la llamada asincrona ha fallado. Crearemos un nuevo Error con el texto "Fallo de red".
     * esMayorDeEdad la podriamos dejar como vi.fn() o no ponerla, ya que el test debería de fallar antes de ejecutarse.
     */    

    // TODO - Añadir los providers necesarios
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [],
    });

    const fixture = TestBed.createComponent(HomePage);
    const component = fixture.componentInstance;

    /* TODO - rejects se representa en la implementación como un mensaje visible.
     * Llamar al método comprobarEdadAsync, tener en cuenta la asincronía
     */

    // TODO - error será "No se ha podido calcular la edad."
    
    // TODO - resultado será ""

    // TODO - cargando será false

  });

  describe('Aviso temporal', () => {
    afterEach(() => {
      // TODO - Ningún test debe dejar el reloj falso activo para el siguiente.

    });

    it('conserva el mensaje justo antes de 4000 ms', () => {
      // TODO - Hacer uso de un Timer falso
      
      // TODO - Crear un component para HomePage
      
      // TODO - Llamar a mostrarAvisoTemporal con un mensaje "Mensaje de prueba"
      
      // TODO - segundosRestantes serán 4
      
      // TODO - comprobar el comportamiento justo antes de que transcurran los 4000ms, justo en 3999 

      // TODO - resutaldo será el mismo mensaje que hemos puesto antes "Mensaje de prueba"
      
      // TODO - segundosRestantes será 1

    });

    it('elimina el mensaje exactamente a los 4000 ms', () => {
      // TODO - Hacer uso de un Timer falso
      
      // TODO - Crear un component de HomePage

      // TODO - Llamar a mostrarAvisoTemporal con un mensaje "Mensaje de prueba"

      // TODO - comprobar el comportamiento justo en 4000ms

      // TODO - resultado será ""
      
      // segundosRestantes será 0

    });
  });
});
