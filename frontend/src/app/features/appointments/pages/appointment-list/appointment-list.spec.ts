import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';
import { AppointmentList } from '@appointments/pages/appointment-list/appointment-list';

let component: AppointmentList;
let fixture: ComponentFixture<AppointmentList>;
let appointmentService: {
  getAll: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const appointments: Appointment[] = [
  {
    id: 1,
    description: 'Consulta inicial',
    appointment_type_id: 1,
    starts_at: '2026-09-14T10:00:00',
    ends_at: '2026-09-14T11:00:00',
  },
];

const searchableAppointments: Appointment[] = [
  {
    ...appointments[0],
    notes: 'Primera visita',
  },
  {
    id: 2,
    description: 'Seguimiento',
    notes: 'Revisar resultados de laboratorio',
    appointment_type_id: 1,
    starts_at: '2026-09-15T10:00:00',
    ends_at: '2026-09-15T11:00:00',
  },
  {
    id: 3,
    description: 'Cita administrativa',
    appointment_type_id: 1,
    starts_at: '2026-09-16T10:00:00',
    ends_at: '2026-09-16T11:00:00',
  },
];

beforeEach(async () => {
  appointmentService = {
    getAll: vi.fn().mockReturnValue(of(appointments)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };

  await TestBed.configureTestingModule({
    imports: [AppointmentList],
    providers: [
      { provide: AppointmentService, useValue: appointmentService },
    ],
  }).compileComponents();
});

function createComponent(): void {
  fixture = TestBed.createComponent(AppointmentList);
  component = fixture.componentInstance;
}

describe('AppointmentList', () => {
  it('creates the component and loads appointments through the initial effect', async () => {
    // Arrange
    createComponent();

    // Act
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(component).toBeTruthy();
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });

  it('reloads appointments when refreshTrigger changes', async () => {
    // Arrange
    createComponent();
    fixture.detectChanges();
    await fixture.whenStable();
    const callsBeforeRefresh = appointmentService.getAll.mock.calls.length;

    // Act
    fixture.componentRef.setInput('refreshTrigger', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(appointmentService.getAll).toHaveBeenCalledTimes(callsBeforeRefresh + 1);
    expect(component.appointments()).toEqual(appointments);
  });

  it('logs an error when loading appointments fails', async () => {
    // Arrange
    appointmentService.getAll.mockReturnValue(throwError(() => new Error('Network error')));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createComponent();

    // Act
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading appointments:',
      expect.any(Error),
    );
  });

  it('returns all appointments when searchTerm is empty', () => {
    // Arrange
    createComponent();
    appointmentService.getAll.mockReturnValue(of(searchableAppointments));
    fixture.componentRef.setInput('searchTerm', '   ');

    // Act
    fixture.detectChanges();
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual(searchableAppointments);
  });

  it('filters appointments by description without case sensitivity', () => {
    // Arrange
    createComponent();
    appointmentService.getAll.mockReturnValue(of(searchableAppointments));
    fixture.componentRef.setInput('searchTerm', 'SEGUIMIENTO');

    // Act
    fixture.detectChanges();
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual([searchableAppointments[1]]);
  });

  it('filters appointments by notes and ignores appointments without notes', () => {
    // Arrange
    createComponent();
    appointmentService.getAll.mockReturnValue(of(searchableAppointments));
    fixture.componentRef.setInput('searchTerm', 'laboratorio');

    // Act
    fixture.detectChanges();
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual([searchableAppointments[1]]);
  });

  it('renders appointments that match the searchTerm input', () => {
    // Arrange
    appointmentService.getAll.mockReturnValue(of(searchableAppointments));
    createComponent();
    fixture.componentRef.setInput('searchTerm', 'administrativa');

    // Act
    fixture.detectChanges();
    const renderedAppointments = fixture.nativeElement.querySelectorAll('h3');

    // Assert
    expect(renderedAppointments).toHaveLength(1);
    expect(renderedAppointments[0].textContent).toContain('Cita administrativa');
  });

  it('emits the selected appointment to open the edit modal from its parent', () => {
    // Arrange
    createComponent();
    let emittedAppointment: Appointment | undefined;
    component.editAppointment.subscribe((appointment) => emittedAppointment = appointment);

    // Act
    component.openEditModal(appointments[0]);

    // Assert
    expect(emittedAppointment).toEqual(appointments[0]);
  });

  it('emits the selected appointment when a card is pressed on a small screen', () => {
    // Arrange
    createComponent();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    let emittedAppointment: Appointment | undefined;
    component.editAppointment.subscribe((appointment) => emittedAppointment = appointment);

    // Act
    component.openEditFromCard(appointments[0]);

    // Assert
    expect(emittedAppointment).toEqual(appointments[0]);
    vi.unstubAllGlobals();
  });

  it('does not delete an appointment when confirmation is cancelled', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    // Act
    component.deleteAppointment(appointments[0].id);

    // Assert
    expect(appointmentService.delete).not.toHaveBeenCalled();
  });

  it('deletes an appointment and reloads the list when confirmed', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const callsBeforeDelete = appointmentService.getAll.mock.calls.length;

    // Act
    component.deleteAppointment(appointments[0].id);

    // Assert
    expect(appointmentService.delete).toHaveBeenCalledWith(appointments[0].id);
    expect(appointmentService.getAll).toHaveBeenCalledTimes(callsBeforeDelete + 1);
    expect(component.appointments()).toEqual(appointments);
  });
});