import { Component, inject, OnInit, signal } from '@angular/core';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly appointmentTypeService = inject(AppointmentTypeService);

  readonly appointmentTypes = signal<AppointmentType[]>([]);

  ngOnInit(): void {
    this.appointmentTypeService.getAll()
    .subscribe({
      next: (appointmentTypes) => {
        this.appointmentTypes.set(appointmentTypes);

        console.log('Appointment types:', appointmentTypes);
      },
      error: (error) => {
        console.error('Error loading appointment types:', error);
      }
    });
  }
}