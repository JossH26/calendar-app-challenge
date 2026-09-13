import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentTypeModal } from './appointment-type-modal';

let component: AppointmentTypeModal;
let fixture: ComponentFixture<AppointmentTypeModal>;
let appointmentTypeService: {
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const appointmentType: AppointmentType = { id: 1, name: 'Consulta' };

beforeEach(async () => {
  appointmentTypeService = {
    create: vi.fn().mockReturnValue(of(appointmentType)),
    update: vi.fn().mockReturnValue(of(appointmentType)),
  };

  await TestBed.configureTestingModule({
    imports: [AppointmentTypeModal],
    providers: [
      { provide: AppointmentTypeService, useValue: appointmentTypeService },
    ],
  }).compileComponents();
});

function createComponent(input?: AppointmentType): void {
  fixture = TestBed.createComponent(AppointmentTypeModal);
  component = fixture.componentInstance;
  component.appointmentType = input;
  fixture.detectChanges();
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

  it('initializes the form as invalid when name is empty', () => {
    // Arrange
    createComponent();

    // Act
    const isInvalid = component.form.invalid;

    // Assert
    expect(isInvalid).toBe(true);
  });

  it('loads the appointment type name into the form', () => {
    // Arrange
    createComponent(appointmentType);

    // Act
    const name = component.form.controls.name.value;

    // Assert
    expect(name).toBe(appointmentType.name);
  });
});

describe('save', () => {
    it('does not create or update when the form is invalid', () => {
      // Arrange
      createComponent();

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.create).not.toHaveBeenCalled();
      expect(appointmentTypeService.update).not.toHaveBeenCalled();
    });

    it('creates an appointment type when no input exists', () => {
      // Arrange
      createComponent();
      component.form.controls.name.setValue('Control');

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.create).toHaveBeenCalledWith({ name: 'Control' });
      expect(appointmentTypeService.update).not.toHaveBeenCalled();
    });

    it('updates an appointment type when an input exists', () => {
      // Arrange
      createComponent(appointmentType);
      component.form.controls.name.setValue('Seguimiento');

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.update).toHaveBeenCalledWith(1, { name: 'Seguimiento' });
      expect(appointmentTypeService.create).not.toHaveBeenCalled();
    });

    it('emits saved after a successful create', () => {
      // Arrange
      createComponent();
      const savedSpy = vi.spyOn(component.saved, 'emit');
      component.form.controls.name.setValue('Control');

      // Act
      component.save();

      // Assert
      expect(savedSpy).toHaveBeenCalledOnce();
    });

    it('emits saved after a successful update', () => {
      // Arrange
      createComponent(appointmentType);
      const savedSpy = vi.spyOn(component.saved, 'emit');
      component.form.controls.name.setValue('Seguimiento');

      // Act
      component.save();

      // Assert
      expect(savedSpy).toHaveBeenCalledOnce();
    });
});

describe('closeModal', () => {
    it('emits close', () => {
      // Arrange
      createComponent();
      const closeSpy = vi.spyOn(component.close, 'emit');

      // Act
      component.closeModal();

      // Assert
      expect(closeSpy).toHaveBeenCalledOnce();
    });
});
