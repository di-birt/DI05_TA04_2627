import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { EdadService } from './edad.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnDestroy {
  anyoNacimiento = 2000;
  resultado = '';
  cargando = false;
  error = '';
  segundosRestantes = 0;

  private readonly edadService = inject(EdadService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private avisoTimer: ReturnType<typeof setTimeout> | undefined;
  private avisoInterval: ReturnType<typeof setInterval> | undefined;

  mayorDeEdad(edad: number): boolean {
    return this.edadService.esMayorDeEdad(edad);
  }

  calcularEdad(anyoNacimiento: number): number {
    return this.edadService.calcularEdad(anyoNacimiento);
  }

  esMayorDeEdadPorAño(anyoNacimiento: number): boolean {
    const edad = this.calcularEdad(anyoNacimiento);
    return this.mayorDeEdad(edad);
  }

  comprobarEdad(): void {
    const edad = this.calcularEdad(this.anyoNacimiento);
    this.resultado = this.mayorDeEdad(edad)
      ? `Tiene ${edad} años y es mayor de edad.`
      : `Tiene ${edad} años y es menor de edad.`;
  }

  async comprobarEdadAsync(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      // await pausa el método hasta que el servicio entrega la edad.
      const edad = await this.edadService.cargarEdad(this.anyoNacimiento);
      const mensaje = this.mayorDeEdad(edad)
        ? `Tiene ${edad} años y es mayor de edad.`
        : `Tiene ${edad} años y es menor de edad.`;

      this.mostrarAvisoTemporal(mensaje);
    } catch {
      // El error se hace visible para que la interfaz no parezca bloqueada.
      this.error = 'No se ha podido calcular la edad.';
      this.resultado = '';
    } finally {
      this.cargando = false;
    }
  }

  mostrarAvisoTemporal(mensaje: string): void {
    if (this.avisoTimer !== undefined) {
      clearTimeout(this.avisoTimer);
    }
    if (this.avisoInterval !== undefined) {
      clearInterval(this.avisoInterval);
    }

    this.resultado = mensaje;
    this.segundosRestantes = 4;
    // Actualiza inmediatamente la vista para que se vea el valor inicial.
    this.changeDetector.markForCheck();
    // El intervalo hace visible en la interfaz el tiempo que queda.
    this.avisoInterval = setInterval(() => {
      this.segundosRestantes -= 1;
      // El callback ocurre fuera del ciclo normal del evento de la plantilla.
      this.changeDetector.markForCheck();
    }, 1000);
    // El reloj real se sustituye por uno falso en los tests de Vitest.
    this.avisoTimer = setTimeout(() => {
      this.resultado = '';
      this.segundosRestantes = 0;
      if (this.avisoInterval !== undefined) {
        clearInterval(this.avisoInterval);
        this.avisoInterval = undefined;
      }
      this.avisoTimer = undefined;
      this.changeDetector.markForCheck();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.avisoTimer !== undefined) {
      clearTimeout(this.avisoTimer);
    }
    if (this.avisoInterval !== undefined) {
      clearInterval(this.avisoInterval);
    }
  }
}
