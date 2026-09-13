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
};

const appointments: Appointment[] = [
  {
    id: 1,
    description: 'Consulta inicial',
    appointment_type_id: 1,
  },
];

beforeEach(async () => {
  appointmentService = {
    getAll: vi.fn().mockReturnValue(of(appointments)),
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

describe('ngOnInit', () => {
  it('creates the component', () => {
    // Arrange
    createComponent();

    // Act
    const result = component;

    // Assert
    expect(result).toBeTruthy();
  });

  it('loads the appointments', () => {
    // Arrange
    createComponent();

    // Act
    component.ngOnInit();

    // Assert
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });

  it('renders the loaded appointments', () => {
    // Arrange
    createComponent();

    // Act
    fixture.detectChanges();
    const appointmentDescription = fixture.nativeElement.querySelector('h3')?.textContent;

    // Assert
    expect(appointmentDescription).toContain(appointments[0].description);
  });

  it('renders the empty state when no appointments exist', () => {
    // Arrange
    appointmentService.getAll.mockReturnValue(of([]));
    createComponent();

    // Act
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('p')?.textContent;

    // Assert
    expect(emptyState).toContain('No hay');
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
});

describe('getUpcomingAppointments', () => {
  it('excludes appointments without a start date and appointments in the past', () => {
    // Arrange
    createComponent();
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const appointmentsToFilter: Appointment[] = [
      { 
        id: 1, 
        description: 'Sin fecha', 
        appointment_type_id: 1 
      },
      {
        id: 2,
        description: 'Pasada',
        appointment_type_id: 1,
        starts_at: yesterday.toISOString(),
      },
      {
        id: 3,
        description: 'Próxima',
        appointment_type_id: 1,
        starts_at: tomorrow.toISOString(),
      },
    ];

    // Act
    const result = component['getAppointments'](appointmentsToFilter);

    // Assert
    expect(result).toEqual([appointmentsToFilter[2]]);
  });

  it('sorts upcoming appointments by start date', () => {
    // Arrange
    createComponent();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsToSort: Appointment[] = [
      {
        id: 2,
        description: 'Segunda',
        appointment_type_id: 1,
        starts_at: dayAfterTomorrow.toISOString(),
      },
      {
        id: 1,
        description: 'Primera',
        appointment_type_id: 1,
        starts_at: tomorrow.toISOString(),
      },
    ];

    // Act
    const result = component['getAppointments'](appointmentsToSort);

    // Assert
    expect(result).toEqual([appointmentsToSort[1], appointmentsToSort[0]]);
  });
});
