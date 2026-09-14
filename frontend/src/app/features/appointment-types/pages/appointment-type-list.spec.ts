import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentTypeList } from './appointment-type-list';

let component: AppointmentTypeList;
let fixture: ComponentFixture<AppointmentTypeList>;
let appointmentTypeService: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

const appointmentTypes: AppointmentType[] = [
  { id: 1, name: 'Consulta', color: '#D98F6F' },
  { id: 2, name: 'Seguimiento', color: '#7C3F2D' },
];

beforeEach(async () => {
  appointmentTypeService = {
    getAll: vi.fn().mockReturnValue(of(appointmentTypes)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };

  await TestBed.configureTestingModule({
    imports: [AppointmentTypeList],
    providers: [{ provide: AppointmentTypeService, useValue: appointmentTypeService }],
  }).compileComponents();
});

function createComponent(): void {
  fixture = TestBed.createComponent(AppointmentTypeList);
  component = fixture.componentInstance;
}

describe('AppointmentTypeList', () => {
  it('creates the component and displays the administration modal', () => {
    // Arrange
    createComponent();

    // Act
    const result = component;

    // Assert
    expect(result).toBeTruthy();
    expect(component.isListModalOpen()).toBe(true);
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

  it('opens the create form and temporarily hides the list modal', () => {
    // Arrange
    createComponent();
    component.selectedAppointmentType.set(appointmentTypes[0]);

    // Act
    component.openCreateModal();

    // Assert
    expect(component.isListModalOpen()).toBe(false);
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointmentType()).toBeUndefined();
  });

  it('opens the edit form with the selected appointment type and hides the list modal', () => {
    // Arrange
    createComponent();

    // Act
    component.openEditModal(appointmentTypes[0]);

    // Assert
    expect(component.isListModalOpen()).toBe(false);
    expect(component.isModalOpen()).toBe(true);
    expect(component.selectedAppointmentType()).toEqual(appointmentTypes[0]);
  });

  it('closes the administration modal', () => {
    // Arrange
    createComponent();

    // Act
    component.closeListModal();

    // Assert
    expect(component.isListModalOpen()).toBe(false);
  });

  it('returns to the administration modal when the form is closed', () => {
    // Arrange
    createComponent();
    component.openEditModal(appointmentTypes[0]);

    // Act
    component.closeModal();

    // Assert
    expect(component.isListModalOpen()).toBe(true);
    expect(component.isModalOpen()).toBe(false);
    expect(component.selectedAppointmentType()).toBeUndefined();
  });

  it('reloads the appointment types before returning to the list after saving', () => {
    // Arrange
    createComponent();
    component.openEditModal(appointmentTypes[0]);

    // Act
    component.onSaved();

    // Assert
    expect(appointmentTypeService.getAll).toHaveBeenCalledOnce();
    expect(component.appointmentTypes()).toEqual(appointmentTypes);
    expect(component.isListModalOpen()).toBe(true);
    expect(component.isModalOpen()).toBe(false);
  });

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
