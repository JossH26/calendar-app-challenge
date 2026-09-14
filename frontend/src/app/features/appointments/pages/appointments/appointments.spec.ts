import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Appointment } from '@models/appointment.model';
import { Appointments } from './appointments';

describe('Appointments', () => {
  let component: Appointments;
  let fixture: ComponentFixture<Appointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Appointments],
    }).compileComponents();

    fixture = TestBed.createComponent(Appointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    // Arrange
    const result = component;

    // Act
    fixture.detectChanges();

    // Assert
    expect(result).toBeTruthy();
  });

  it('keeps the active view when opening and closing the appointment modal', () => {
    // Arrange
    const appointment = { id: 1 } as Appointment;
    component.showCalendar();

    // Act
    component.openEditModal(appointment);

    // Assert
    expect(component.selectedView()).toBe('calendar');
    expect(component.isCreateModalOpen()).toBe(true);

    // Act
    component.closeCreateModal();

    // Assert
    expect(component.selectedView()).toBe('calendar');
    expect(component.isCreateModalOpen()).toBe(false);
  });
});
