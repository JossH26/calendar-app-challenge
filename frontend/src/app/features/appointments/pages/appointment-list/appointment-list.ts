import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AppointmentModal } from '@appointments/modal/appointment-modal/appointment-modal';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';

@Component({
  selector: 'app-appointment-list',
  imports: [
    CommonModule,
    AppointmentModal
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentList implements OnInit {
    private readonly appointmentService = inject(AppointmentService);
    readonly appointments = signal<Appointment[]>([]);
    readonly isModalOpen = signal(false);
    readonly selectedAppointment = signal<Appointment | undefined>(undefined);

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

            return new Date(appointment.starts_at) >= today;
        })
        .sort((a, b) => {
            return (
                new Date(a.starts_at!).getTime() -
                new Date(b.starts_at!).getTime()
            );
        });
    }

    onSaved() {
        this.closeModal();
        this.loadAppointments();
    }

    openCreateModal() {
        this.selectedAppointment.set(undefined);
        this.isModalOpen.set(true);
    }

    openEditModal(appointment: Appointment) {
        this.selectedAppointment.set(appointment);
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedAppointment.set(undefined);
    }

    deleteAppointment(id: number): void {
        const confirmed = confirm('¿Deseas eliminar esta cita?');

        if (!confirmed)
            return;

        this.appointmentService.delete(id).subscribe({
            next: () => {
                this.loadAppointments();
            },
            error: (error) => {
                console.error('Error deleting appointment:', error);
            }
        });
    }
}