import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';

@Component({
  selector: 'app-appointment-type-list',
  imports: [CommonModule],
  templateUrl: './appointment-type-list.html',
  styleUrl: './appointment-type-list.scss'
})
export class AppointmentTypeList implements OnInit {
  private readonly appointmentTypeService = inject(AppointmentTypeService);

  readonly appointmentTypes = signal<AppointmentType[]>([]);

  ngOnInit(): void {
    this.loadAppointmentTypes();
  }

  private loadAppointmentTypes(): void {
    this.appointmentTypeService.getAll().subscribe({
      next: (appointmentTypes) => {
        this.appointmentTypes.set(appointmentTypes);
      },
      error: (error) => {
        console.error('Error loading appointment types:', error);
      }
    });
  }
}