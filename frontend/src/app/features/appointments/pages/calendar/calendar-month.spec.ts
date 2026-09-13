import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';
import { CalendarMonth } from './calendar-month';

let component: CalendarMonth;
let fixture: ComponentFixture<CalendarMonth>;
let appointmentService: {
  getAll: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const appointments: Appointment[] = [
  {
    id: 1,
    description: 'Consulta inicial',
    notes: 'Traer estudios previos',
    appointment_type_id: 1,
    appointment_type: { id: 1, name: 'Consulta', color: '#1a73e8' },
    starts_at: '2024-02-14T10:00:00',
    ends_at: '2024-02-14T11:00:00',
  },
];

beforeEach(async () => {
  appointmentService = {
    getAll: vi.fn().mockReturnValue(of(appointments)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };

  await TestBed.configureTestingModule({
    imports: [CalendarMonth],
    providers: [
      { provide: AppointmentService, useValue: appointmentService },
    ],
  }).compileComponents();
});

function createComponent(): void {
  fixture = TestBed.createComponent(CalendarMonth);
  component = fixture.componentInstance;
}

describe('CalendarMonth', () => {
  it('creates the component and initializes the days for the current month', () => {
    // Arrange
    createComponent();

    // Act
    const days = component.days();

    // Assert
    expect(component).toBeTruthy();
    expect(days.filter(Boolean)).toHaveLength(
      new Date(component.currentDate().getFullYear(), component.currentDate().getMonth() + 1, 0).getDate(),
    );
  });

  it('loads and renders appointments on initialization', () => {
    // Arrange
    createComponent();

    // Act
    fixture.detectChanges();

    // Assert
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });

  it('logs an error when loading appointments fails', () => {
    // Arrange
    appointmentService.getAll.mockReturnValue(throwError(() => new Error('Error de red')));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createComponent();

    // Act
    component.ngOnInit();

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading appointments:',
      expect.any(Error),
    );
  });

  it('adds leading empty days with Monday as the first day of the week', () => {
    // Arrange
    createComponent();

    // Act
    component.changeMonth(8);
    component.changeYear(2024);

    // Assert
    expect(component.days().slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(component.days()[6]?.getDate()).toBe(1);
  });

  it('changes to the previous and next month', () => {
    // Arrange
    createComponent();
    component.currentDate.set(new Date(2024, 0, 1));

    // Act
    component.previousMonth();

    // Assert
    expect(component.currentDate()).toEqual(new Date(2023, 11, 1));

    // Act
    component.nextMonth();

    // Assert
    expect(component.currentDate()).toEqual(new Date(2024, 0, 1));
  });

  it('changes the displayed month and year', () => {
    // Arrange
    createComponent();
    component.currentDate.set(new Date(2024, 0, 1));

    // Act
    component.changeMonth(5);
    component.changeYear(2026);

    // Assert
    expect(component.currentDate()).toEqual(new Date(2026, 5, 1));
  });

  it('returns only appointments scheduled on the requested day', () => {
    // Arrange
    createComponent();
    const otherDay: Appointment = {
      ...appointments[0],
      id: 2,
      starts_at: '2024-02-15T10:00:00',
    };
    const withoutStartDate: Appointment = { ...appointments[0], id: 3, starts_at: undefined };
    component.appointments.set([...appointments, otherDay, withoutStartDate]);

    // Act
    const result = component.getAppointmentsByDay(new Date(2024, 1, 14));

    // Assert
    expect(result).toEqual([appointments[0]]);
  });

  it('opens and closes the edit modal with the selected appointment', () => {
    // Arrange
    createComponent();

    // Act
    component.openEditModal(appointments[0]);

    // Assert
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointment()).toEqual(appointments[0]);

    // Act
    component.closeModal();

    // Assert
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointment()).toBeUndefined();
  });

  it('builds a tooltip with the appointment details', () => {
    // Arrange
    createComponent();

    // Act
    const tooltip = component.getAppointmentTooltip(appointments[0]);

    // Assert
    expect(tooltip).toContain('Consulta inicial');
    expect(tooltip).toContain('Tipo: Consulta');
    expect(tooltip).toContain('Notas: Traer estudios previos');
  });

  it('does not delete an appointment when confirmation is cancelled', () => {
    // Arrange
    createComponent();
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    // Act
    component.deleteAppointment(event, appointments[0].id);

    // Assert
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(appointmentService.delete).not.toHaveBeenCalled();
  });

  it('deletes an appointment and reloads the calendar when confirmed', () => {
    // Arrange
    createComponent();
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    component.deleteAppointment(event, appointments[0].id);

    // Assert
    expect(appointmentService.delete).toHaveBeenCalledWith(appointments[0].id);
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });
});
