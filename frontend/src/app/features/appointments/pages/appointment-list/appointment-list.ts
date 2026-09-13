import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';

@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentList implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  readonly appointments = signal<Appointment[]>([]);

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments = () =>
        this.appointmentService.getAll().subscribe({
        next: (appointments) => {
            this.appointments.set(appointments);
        },
        error: (error) => {
            console.error('Error loading appointments:', error);
        }
        });

    private getAppointments(appointments: Appointment[]): Appointment[] {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return appointments.filter((appointment) => {
            if (!appointment.starts_at)
                return false;

            return new Date(appointment.starts_at) >= today;})
            .sort((a, b) => {
                return (
                    new Date(a.starts_at!).getTime() -
                    new Date(b.starts_at!).getTime()
                );
            });
    }
}