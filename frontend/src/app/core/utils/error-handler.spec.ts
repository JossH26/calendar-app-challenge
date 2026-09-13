import { ErrorHandler } from './error-handler';

describe('getMessage', () => {
  it('returns the provided default message when the error has no backend payload', () => {
    // Arrange
    const defaultMessage = 'No fue posible guardar.';

    // Act
    const result = ErrorHandler.getMessage(undefined, defaultMessage);

    // Assert
    expect(result).toBe(defaultMessage);
  });

  it('returns the title validation message for a description error', () => {
    // Arrange
    const error = { error: { description: ['no puede estar vacío'] } };

    // Act
    const result = ErrorHandler.getMessage(error);

    // Assert
    expect(result).toBe('Favor de agregar un título.');
  });

  it('returns the appointment type validation message for an appointment type error', () => {
    // Arrange
    const error = { error: { appointment_type: ['no es válido'] } };

    // Act
    const result = ErrorHandler.getMessage(error);

    // Assert
    expect(result).toBe('Favor de seleccionar un tipo de cita válido.');
  });

  it('joins unrecognized backend validation messages', () => {
    // Arrange
    const error = { error: { starts_at: ['es inválida'], ends_at: ['es requerida'] } };

    // Act
    const result = ErrorHandler.getMessage(error);

    // Assert
    expect(result).toBe('es inválida, es requerida');
  });
});
