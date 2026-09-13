export class ErrorHandler {
  static getMessage(error: any, defaultMessage = 'Ocurrió un error.'): string {
    const backendError = error?.error;

    if (!backendError)
      return defaultMessage;

    if (backendError.description)
      return 'Favor de agregar un título.';

    if (backendError.name)
      return 'Favor de agregar un nombre.';

    if (backendError.appointment_type)
      return 'Favor de seleccionar un tipo de cita válido.';

    const messages = Object.values(backendError).flat();

    return messages.join(', ');
  }
}