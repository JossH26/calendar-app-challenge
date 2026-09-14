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

const appointmentType: AppointmentType = {
  id: 1,
  name: 'Consulta',
  color: '#3B82F6',
};

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
    expect(component.form.controls.color.value).toBe('');
  });

  it('loads the appointment type name and color into the form', () => {
    // Arrange
    createComponent(appointmentType);

    // Act
    const name = component.form.controls.name.value;

    // Assert
    expect(name).toBe(appointmentType.name);
    expect(component.form.controls.color.value).toBe(appointmentType.color);
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

    it('does not create an appointment type when its name contains only symbols', () => {
      // Arrange
      createComponent();
      component.form.controls.name.setValue('!@#$%');

      // Act
      component.save();

      // Assert
      expect(component.form.controls.name.errors?.['required']).toBeTruthy();
      expect(appointmentTypeService.create).not.toHaveBeenCalled();
    });

    it('uses a light gray color when no color is selected', () => {
      // Arrange
      createComponent();
      component.form.controls.name.setValue('Control');

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.create).toHaveBeenCalledWith({
        name: 'Control',
        color: '#D1D5DB',
      });
    });
    
    it('creates an appointment type when no input exists', () => {
      // Arrange
      createComponent();
      component.form.controls.name.setValue('Control');
      component.form.controls.color.setValue('#EF4444');

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.create).toHaveBeenCalledWith({
        name: 'Control',
        color: '#EF4444',
      });
      expect(appointmentTypeService.update).not.toHaveBeenCalled();
    });

    it('updates an appointment type when an input exists', () => {
      // Arrange
      createComponent(appointmentType);
      component.form.controls.name.setValue('Seguimiento');
      component.form.controls.color.setValue('#22C55E');

      // Act
      component.save();

      // Assert
      expect(appointmentTypeService.update).toHaveBeenCalledWith(1, {
        name: 'Seguimiento',
        color: '#22C55E',
      });
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

describe('color selection', () => {
    it('keeps the custom color as a draft until Listo is pressed', () => {
      // Arrange
      createComponent();
      component.beginCustomColorSelection();

      // Act
      component.updateCustomColorDraft('#123456');

      // Assert
      expect(component.customColorDraft()).toBe('#123456');
      expect(component.customColors()).toEqual([]);
      expect(component.form.controls.color.value).toBe('');

      // Act
      component.confirmCustomColor();

      // Assert
      expect(component.customColors()).toEqual(['#123456']);
      expect(component.form.controls.color.value).toBe('#123456');
      expect(component.customColorDraft()).toBeUndefined();
    });

    it('selects a predefined color without removing confirmed custom colors', () => {
      // Arrange
      createComponent();
      component.updateCustomColorDraft('#123456');
      component.confirmCustomColor();

      // Act
      component.selectPredefinedColor('#EF4444');

      // Assert
      expect(component.form.controls.color.value).toBe('#EF4444');
      expect(component.customColors()).toEqual(['#123456']);
      expect(component.isSelectedColor('#EF4444')).toBe(true);
    });

    it('allows up to five confirmed temporary custom colors', () => {
      // Arrange
      createComponent();
      const customColors = ['#111111', '#222222', '#333333', '#444444', '#555555'];

      // Act
      customColors.forEach((color) => {
        component.updateCustomColorDraft(color);
        component.confirmCustomColor();
      });
      component.updateCustomColorDraft('#666666');
      component.confirmCustomColor();

      // Assert
      expect(component.customColors()).toEqual(customColors);
      expect(component.form.controls.color.value).toBe('#555555');
      expect(component.customColorDraft()).toBeUndefined();
    });

    it('loads a saved non-predefined color as the selected custom color', () => {
      // Arrange
      const customAppointmentType: AppointmentType = { ...appointmentType, color: '#123456' };

      // Act
      createComponent(customAppointmentType);

      // Assert
      expect(component.customColors()).toEqual(['#123456']);
      expect(component.isCustomColorSelected('#123456')).toBe(true);
    });

    it('uses a selected custom color in the existing form control', () => {
      // Arrange
      createComponent();
      component.updateCustomColorDraft('#654321');
      component.confirmCustomColor();

      // Act
      component.selectCustomColor('#654321');

      // Assert
      expect(component.form.controls.color.value).toBe('#654321');
      expect(component.isCustomColorSelected('#654321')).toBe(true);
    });
});

describe('closeModal', () => {
    it('emits close', () => {
      // Arrange
      createComponent();
      const closeSpy = vi.spyOn(component.close, 'emit');

      // Act
      component.updateCustomColorDraft('#123456');
      component.confirmCustomColor();
      component.closeModal();

      // Assert
      expect(component.customColors()).toEqual([]);
      expect(closeSpy).toHaveBeenCalledOnce();
    });
});