import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidationsService {
  /**
   * Valida si dos campos de contraseña coinciden.
   * @param password - Nombre del control que contiene la contraseña original.
   * @param confirmPassword - Nombre del control que contiene la confirmación de la contraseña.
   * @returns ValidatorFn - Un validador que compara los dos campos de contraseña.
   */
  passwordsMatch(password: string, confirmPassword: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const pass = formGroup.get(password);
      const confirmPass = formGroup.get(confirmPassword);

      if (!pass?.value || !confirmPass?.value) {
        // confirmPass?.setErrors({ required: true });
        return { passwordMismatch: null };
      }

      if (pass.value !== confirmPass.value) {
        confirmPass.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPass.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Valida la fortaleza de la contraseña.
   * Este validador personalizado comprueba que una contraseña cumpla con los siguientes requisitos de seguridad:
   * - Longitud mínima de 6 caracteres.
   * - Al menos una letra mayúscula.
   * - Al menos una letra minúscula.
   * - Al menos un carácter especial (por ejemplo: !@#$%^&*(),.?":{}|<>).
   *
   * Si la contraseña no cumple con alguno de estos requisitos, el validador devolverá un error de `passwordStrength`
   * con un mensaje descriptivo. Si la contraseña cumple con todos los criterios, devolverá `null`, indicando
   * que es válida.
   *
   * @returns ValidatorFn - Un validador de Angular que verifica la fortaleza de la contraseña.
   */
  passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isValidLength = password?.length >= 6;

      if (!hasUpperCase || !hasLowerCase || !hasSpecialChar || !isValidLength) {
        return {
          passwordStrength:
            'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un carácter especial'
        };
      }

      return null;
    };
  }

  /**
   * Valida si una fecha es menor a la fecha actual
   * @returns ValidatorFn que verifica si la fecha es menor a la actual
   */
  isLessThanToday(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return inputDate < today ? { futureDate: true } : null;
    };
  }

  /**
   * Valida si una fecha es menor a la fecha actual permitiendo que sea igual
   * @returns ValidatorFn que verifica si la fecha es menor o igual a la actual
   */
  isLessThanOrEqualToday(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return inputDate <= today ? { futureDate: true } : null;
    };
  }

  /**
   * Valida si una fecha está dentro de un rango específico
   * @param minDate Fecha mínima permitida
   * @param maxDate Fecha máxima permitida (opcional, por defecto es la fecha actual)
   * @returns ValidatorFn que verifica si la fecha está dentro del rango
   */
  isDateInRange(minDate: Date, maxDate: Date = new Date()): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      minDate.setHours(0, 0, 0, 0);
      maxDate.setHours(0, 0, 0, 0);

      if (inputDate < minDate) {
        return { beforeMinDate: true };
      }

      if (inputDate > maxDate) {
        return { afterMaxDate: true };
      }

      return null;
    };
  }
}
