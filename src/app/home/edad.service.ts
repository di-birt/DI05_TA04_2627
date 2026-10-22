import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EdadService {
  calcularEdad(anyoNacimiento: number): number {
    return new Date().getFullYear() - anyoNacimiento;
  }

  // Una promesa representa un resultado que estará disponible más adelante.
  cargarEdad(anyoNacimiento: number): Promise<number> {
    // La demora simula una petición asíncrona sin realizar ninguna petición real.
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.calcularEdad(anyoNacimiento)), 1000);
    });
  }

  esMayorDeEdad(edad: number): boolean {
    return edad >= 18;
  }
}