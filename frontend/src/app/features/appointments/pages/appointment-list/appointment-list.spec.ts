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
  },
];

const searchableAppointments: Appointment[] = [
  {
    id: 1,
    description: 'Consulta inicial',
    notes: 'Primera visita',
    appointment_type_id: 1,
  },
  {
    id: 2,
    description: 'Seguimiento',
    notes: 'Revisar resultados de laboratorio',
    appointment_type_id: 1,
  },
  {
    id: 3,
    description: 'Cita administrativa',
    appointment_type_id: 1,
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

describe('getAppointments', () => {
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

describe('filteredAppointments', () => {
  it('returns all appointments when the search term is empty', () => {
    // Arrange
    createComponent();
    component.appointments.set(searchableAppointments);
    component.searchTerm.set('   ');

    // Act
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual(searchableAppointments);
  });

  it('filters appointments by description without case sensitivity', () => {
    // Arrange
    createComponent();
    component.appointments.set(searchableAppointments);
    component.searchTerm.set('SEGUIMIENTO');

    // Act
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual([searchableAppointments[1]]);
  });

  it('filters appointments by notes and ignores appointments without notes', () => {
    // Arrange
    createComponent();
    component.appointments.set(searchableAppointments);
    component.searchTerm.set('laboratorio');

    // Act
    const result = component.filteredAppointments();

    // Assert
    expect(result).toEqual([searchableAppointments[1]]);
  });

  it('updates the rendered appointments when the search input changes', () => {
    // Arrange
    appointmentService.getAll.mockReturnValue(of(searchableAppointments));
    createComponent();
    fixture.detectChanges();
    const searchInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    searchInput.value = 'administrativa';

    // Act
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const renderedAppointments = fixture.nativeElement.querySelectorAll('h3');

    // Assert
    expect(renderedAppointments).toHaveLength(1);
    expect(renderedAppointments[0].textContent).toContain('Cita administrativa');
  });
});

describe('openCreateModal', () => {
  it('opens the modal without a selected appointment', () => {
    // Arrange
    createComponent();
    component.selectedAppointment.set(appointments[0]);

    // Act
    component.openCreateModal();

    // Assert
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointment()).toBeUndefined();
  });
});

describe('openEditModal', () => {
  it('opens the modal with the selected appointment', () => {
    // Arrange
    createComponent();

    // Act
    component.openEditModal(appointments[0]);

    // Assert
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointment()).toEqual(appointments[0]);
  });
});

describe('closeModal', () => {
  it('closes the modal and clears the selected appointment', () => {
    // Arrange
    createComponent();
    component.isModalOpen.set(true);
    component.selectedAppointment.set(appointments[0]);

    // Act
    component.closeModal();

    // Assert
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointment()).toBeUndefined();
  });
});

describe('onSaved', () => {
  it('closes the modal and reloads appointments', () => {
    // Arrange
    createComponent();
    component.isModalOpen.set(true);
    component.selectedAppointment.set(appointments[0]);

    // Act
    component.onSaved();

    // Assert
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointment()).toBeUndefined();
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });
});

describe('deleteAppointment', () => {
  it('does not delete an appointment when the confirmation is cancelled', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    // Act
    component.deleteAppointment(appointments[0].id);

    // Assert
    expect(appointmentService.delete).not.toHaveBeenCalled();
    expect(appointmentService.getAll).not.toHaveBeenCalled();
  });

  it('deletes an appointment and reloads the list when confirmed', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    component.deleteAppointment(appointments[0].id);

    // Assert
    expect(appointmentService.delete).toHaveBeenCalledWith(appointments[0].id);
    expect(appointmentService.getAll).toHaveBeenCalledOnce();
    expect(component.appointments()).toEqual(appointments);
  });
});
