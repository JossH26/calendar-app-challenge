import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Appointment } from '@models/appointment.model';
import { APIS_URL } from '@environments/apis-url';
import { AppointmentService } from '@services/appointment/appointment.service';

let service: AppointmentService;
let httpTestingController: HttpTestingController;

const appointments: Appointment[] = [
  {
    id: 1,
    description: 'Consulta inicial',
    appointment_type_id: 1,
  },
];

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      AppointmentService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  service = TestBed.inject(AppointmentService);
  httpTestingController = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpTestingController.verify();
});

describe('getAll', () => {
  it('gets all appointments', () => {
    // Arrange
    let result: Appointment[] | undefined;

    // Act
    service.getAll().subscribe((appointmentsResponse) => {
      result = appointmentsResponse;
    });

    const request = httpTestingController.expectOne(APIS_URL.APPOINTMENTS);
    request.flush(appointments);

    // Assert
    expect(request.request.method).toBe('GET');
    expect(result).toEqual(appointments);
  });

  it('returns an empty list when no appointments exist', () => {
    // Arrange
    let result: Appointment[] | undefined;

    // Act
    service.getAll().subscribe((appointmentsResponse) => {
      result = appointmentsResponse;
    });

    const request = httpTestingController.expectOne(APIS_URL.APPOINTMENTS);
    request.flush([]);

    // Assert
    expect(request.request.method).toBe('GET');
    expect(result).toEqual([]);
  });

  it('propagates an error when the request fails', () => {
    // Arrange
    let result: HttpErrorResponse | undefined;

    // Act
    service.getAll().subscribe({
      error: (error: HttpErrorResponse) => {
        result = error;
      },
    });

    const request = httpTestingController.expectOne(APIS_URL.APPOINTMENTS);
    request.flush('Error del servidor', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Assert
    expect(request.request.method).toBe('GET');
    expect(result?.status).toBe(500);
  });
});