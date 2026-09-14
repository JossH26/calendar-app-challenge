import { AbstractControl, ValidationErrors } from '@angular/forms';

export class FormValidation {
  static requiredText(control: AbstractControl): ValidationErrors | null {
    return typeof control.value === 'string' && /\p{L}/u.test(control.value)
      ? null
      : { required: true };
  }

  static getMessage(
    control: AbstractControl | null,
    fieldName: string
  ): string | null {
    if (!control || !control.touched || !control.errors)
      return null;

    if (control.errors['required'])
      return `${fieldName} es requerido.`;

    if (control.errors['min'])
      return `${fieldName} no es válido.`;

    return 'Campo inválido.';
  }
}