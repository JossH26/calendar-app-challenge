import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Appointment } from '@models/appointment.model';
import { APIS_URL } from '@environments/apis-url';
import { AppointmentRequest } from '@requests/appointment-request';
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

const appointmentRequest: AppointmentRequest = {
  description: 'Consulta inicial',
  notes: 'Notas',
  appointment_type_id: 1,
  starts_at: '2026-09-13T10:00',
  ends_at: '2026-09-13T11:00',
};

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

describe('update', () => {
  it('updates an appointment with a PATCH request', () => {
    // Arrange
    let result: Appointment | undefined;

    // Act
    service.update(appointments[0].id, appointmentRequest).subscribe((appointmentResponse) => {
      result = appointmentResponse;
    });
    const request = httpTestingController.expectOne(`${APIS_URL.APPOINTMENTS}/1`);
    request.flush(appointments[0]);

    // Assert
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ appointment: appointmentRequest });
    expect(result).toEqual(appointments[0]);
  });
});
