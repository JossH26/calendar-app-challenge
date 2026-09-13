import { AbstractControl } from '@angular/forms';

export class FormValidation {
  static getMessage(
    control: AbstractControl | null,
    fieldName: string
  ): string | null {
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return `${fieldName} es requerido.`;
    }

    if (control.errors['min']) {
      return `${fieldName} no es válido.`;
    }

    return 'Campo inválido.';
  }
}