import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Appointment } from '@models/appointment.model';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentService } from '@services/appointment/appointment.service';
import { AppointmentModal } from './appointment-modal';

let component: AppointmentModal;
let fixture: ComponentFixture<AppointmentModal>;
let appointmentTypeService: {
  getAll: ReturnType<typeof vi.fn>;
};
let appointmentService: {
  create: ReturnType<typeof vi.fn>;
};

const appointmentTypes: AppointmentType[] = [{ id: 1, name: 'Consulta' }];
const appointment: Appointment = {
  id: 1,
  description: 'Consulta inicial',
  appointment_type_id: 1,
};

beforeEach(async () => {
  appointmentTypeService = {
    getAll: vi.fn().mockReturnValue(of(appointmentTypes)),
  };
  appointmentService = {
    create: vi.fn().mockReturnValue(of(appointment)),
  };

  await TestBed.configureTestingModule({
    imports: [AppointmentModal],
    providers: [
      { provide: AppointmentTypeService, useValue: appointmentTypeService },
      { provide: AppointmentService, useValue: appointmentService },
    ],
  }).compileComponents();
});

function createComponent(): void {
  fixture = TestBed.createComponent(AppointmentModal);
  component = fixture.componentInstance;
}

function setValidForm(): void {
  component.form.setValue({
    description: 'Consulta inicial',
    notes: 'Notas',
    appointment_type_id: 1,
    starts_at: '2026-09-13T10:00',
    ends_at: '2026-09-13T11:00',
  });
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

  it('initializes an invalid form and loads appointment types', () => {
    // Arrange
    createComponent();

    // Act
    component.ngOnInit();

    // Assert
    expect(component.form.invalid).toBe(true);
    expect(appointmentTypeService.getAll).toHaveBeenCalledOnce();
    expect(component.appointmentTypes()).toEqual(appointmentTypes);
  });
});

describe('save', () => {
  it('does not create an appointment when the form is invalid', () => {
    // Arrange
    createComponent();
    component.ngOnInit();

    // Act
    component.save();

    // Assert
    expect(appointmentService.create).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('creates an appointment when the form is valid', () => {
    // Arrange
    createComponent();
    component.ngOnInit();
    setValidForm();

    // Act
    component.save();

    // Assert
    expect(appointmentService.create).toHaveBeenCalledWith({
      description: 'Consulta inicial',
      notes: 'Notas',
      appointment_type_id: 1,
      starts_at: '2026-09-13T10:00',
      ends_at: '2026-09-13T11:00',
    });
  });

  it('emits saved after creating an appointment', () => {
    // Arrange
    createComponent();
    component.ngOnInit();
    setValidForm();
    const savedSpy = vi.spyOn(component.saved, 'emit');

    // Act
    component.save();

    // Assert
    expect(savedSpy).toHaveBeenCalledOnce();
  });
});

describe('closeModal', () => {
  it('resets the form and emits close', () => {
    // Arrange
    createComponent();
    component.ngOnInit();
    setValidForm();
    const closeSpy = vi.spyOn(component.close, 'emit');

    // Act
    component.closeModal();

    // Assert
    expect(component.form.controls.description.value).toBe('');
    expect(closeSpy).toHaveBeenCalledOnce();
  });
});
