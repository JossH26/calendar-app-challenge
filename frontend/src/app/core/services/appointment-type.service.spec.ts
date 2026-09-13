import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeRequest } from '@requests/appointment-type-request';
import { APIS_URL } from '@environments/apis-url';
import { AppointmentTypeService } from './appointment-type.service';

let service: AppointmentTypeService;
let httpTestingController: HttpTestingController;

const appointmentType: AppointmentType = {
  id: 1,
  name: 'Consulta',
  color: '#3B82F6',
};
const appointmentTypeRequest: AppointmentTypeRequest = {
  name: 'Consulta',
  color: '#3B82F6',
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      AppointmentTypeService,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  service = TestBed.inject(AppointmentTypeService);
  httpTestingController = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpTestingController.verify();
});

describe('create', () => {
  it('creates an appointment type with its color', () => {
    // Arrange
    let result: AppointmentType | undefined;

    // Act
    service.create(appointmentTypeRequest).subscribe((response) => {
      result = response;
    });
    const request = httpTestingController.expectOne(APIS_URL.APPOINTMENT_TYPES);
    request.flush(appointmentType);

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ appointment_type: appointmentTypeRequest });
    expect(result).toEqual(appointmentType);
  });
});

describe('update', () => {
  it('updates an appointment type with its color', () => {
    // Arrange
    let result: AppointmentType | undefined;

    // Act
    service.update(appointmentType.id, appointmentTypeRequest).subscribe((response) => {
      result = response;
    });
    const request = httpTestingController.expectOne(`${APIS_URL.APPOINTMENT_TYPES}/1`);
    request.flush(appointmentType);

    // Assert
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ appointment_type: appointmentTypeRequest });
    expect(result).toEqual(appointmentType);
  });
});
