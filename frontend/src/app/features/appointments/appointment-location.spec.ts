import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { APIS_URL } from '@environments/apis-url';
import { Appointment } from '@models/appointment.model';
import { AppointmentRequest } from '@requests/appointment-request';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentService } from '@services/appointment/appointment.service';
import { AppointmentModal } from './modal/appointment-modal/appointment-modal';
import { AppointmentList } from './pages/appointment-list/appointment-list';
import { CalendarMonth } from './pages/calendar/calendar-month';

const appointment: Appointment = {
  id: 1,
  description: 'Consulta inicial',
  appointment_type_id: 1,
  location: 'Consultorio 1',
  starts_at: '2026-09-14T10:00:00',
  ends_at: '2026-09-14T11:00:00',
};

const appointmentRequest: AppointmentRequest = {
  description: 'Consulta inicial',
  notes: 'Notas',
  appointment_type_id: 1,
  starts_at: '2026-09-14T10:00',
  ends_at: '2026-09-14T11:00',
  location: 'Consultorio 1',
};

describe('location', () => {
  it('initializes and submits the location from the appointment modal', async () => {
    // Arrange
    const appointmentService = {
      create: vi.fn().mockReturnValue(of(appointment)),
      update: vi.fn().mockReturnValue(of(appointment)),
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentModal],
      providers: [
        { provide: AppointmentService, useValue: appointmentService },
        { provide: AppointmentTypeService, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentModal);
    const component = fixture.componentInstance;
    component.appointment = appointment;
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.location.value).toBe('Consultorio 1');

    // Act
    component.appointment = undefined;
    component.form.setValue(appointmentRequest);
    component.save();

    // Assert
    expect(appointmentService.create).toHaveBeenCalledWith(appointmentRequest);
  });

  it('sends location in the appointment service request', () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const service = TestBed.inject(AppointmentService);
    const http = TestBed.inject(HttpTestingController);

    // Act
    service.create(appointmentRequest).subscribe();
    const request = http.expectOne(APIS_URL.APPOINTMENTS);
    request.flush(appointment);

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ appointment: appointmentRequest });
    http.verify();
  });

  it('renders location in the appointment list', async () => {
    // Arrange
    await TestBed.configureTestingModule({
      imports: [AppointmentList],
      providers: [
        { provide: AppointmentService, useValue: { getAll: vi.fn().mockReturnValue(of([appointment])) } },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<AppointmentList> = TestBed.createComponent(AppointmentList);

    // Act
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    // Assert
    expect(text).toContain('UbicaciÃ³n');
    expect(text).toContain('Consultorio 1');
  });

  it('includes location in the calendar appointment tooltip', async () => {
    // Arrange
    await TestBed.configureTestingModule({
      imports: [CalendarMonth],
      providers: [
        { provide: AppointmentService, useValue: { getAll: vi.fn().mockReturnValue(of([])), delete: vi.fn() } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CalendarMonth);

    // Act
    const tooltip = fixture.componentInstance.getAppointmentTooltip(appointment);

    // Assert
    expect(tooltip).toContain('UbicaciÃ³n: Consultorio 1');
  });
});
