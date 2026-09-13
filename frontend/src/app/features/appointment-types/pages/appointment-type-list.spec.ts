import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentTypeList } from './appointment-type-list';

let component: AppointmentTypeList;
let fixture: ComponentFixture<AppointmentTypeList>;
let appointmentTypeService: {
  getAll: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const appointmentTypes: AppointmentType[] = [
  { id: 1, name: 'Consulta' },
  { id: 2, name: 'Seguimiento' },
];

beforeEach(async () => {
  appointmentTypeService = {
    getAll: vi.fn().mockReturnValue(of(appointmentTypes)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };

  await TestBed.configureTestingModule({
    imports: [AppointmentTypeList],
    providers: [
      { provide: AppointmentTypeService, useValue: appointmentTypeService },
    ],
  }).compileComponents();
});

function createComponent(): void {
  fixture = TestBed.createComponent(AppointmentTypeList);
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

  it('loads the appointment types', () => {
    // Arrange
    createComponent();

    // Act
    component.ngOnInit();

    // Assert
    expect(appointmentTypeService.getAll).toHaveBeenCalledOnce();
    expect(component.appointmentTypes()).toEqual(appointmentTypes);
  });
});

describe('openCreateModal', () => {
  it('opens the modal without a selected appointment type', () => {
    // Arrange
    createComponent();
    component.selectedAppointmentType.set(appointmentTypes[0]);

    // Act
    component.openCreateModal();

    // Assert
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointmentType()).toBeUndefined();
  });
});

describe('openEditModal', () => {
  it('opens the modal with the selected appointment type', () => {
    // Arrange
    createComponent();

    // Act
    component.openEditModal(appointmentTypes[0]);

    // Assert
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointmentType()).toEqual(appointmentTypes[0]);
  });
});

describe('openModal', () => {
  it('opens the modal', () => {
    // Arrange
    createComponent();

    // Act
    component.openModal();

    // Assert
    expect(component.isModalOpen()).toBe(true);
  });
});

describe('closeModal', () => {
  it('closes the modal and clears the selected appointment type', () => {
    // Arrange
    createComponent();
    component.isModalOpen.set(true);
    component.selectedAppointmentType.set(appointmentTypes[0]);

    // Act
    component.closeModal();

    // Assert
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointmentType()).toBeUndefined();
  });
});

describe('onSaved', () => {
  it('closes the modal and reloads the appointment types', () => {
    // Arrange
    createComponent();
    component.isModalOpen.set(true);
    component.selectedAppointmentType.set(appointmentTypes[0]);

    // Act
    component.onSaved();

    // Assert
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointmentType()).toBeUndefined();
    expect(appointmentTypeService.getAll).toHaveBeenCalledOnce();
    expect(component.appointmentTypes()).toEqual(appointmentTypes);
  });
});

describe('deleteAppointmentType', () => {
  it('does not delete when the confirmation is cancelled', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    // Act
    component.deleteAppointmentType(appointmentTypes[0].id);

    // Assert
    expect(appointmentTypeService.delete).not.toHaveBeenCalled();
    expect(appointmentTypeService.getAll).not.toHaveBeenCalled();
  });

  it('deletes the appointment type and reloads the list when confirmed', () => {
    // Arrange
    createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    component.deleteAppointmentType(appointmentTypes[0].id);

    // Assert
    expect(appointmentTypeService.delete).toHaveBeenCalledWith(appointmentTypes[0].id);
    expect(appointmentTypeService.getAll).toHaveBeenCalledOnce();
    expect(component.appointmentTypes()).toEqual(appointmentTypes);
  });
});
