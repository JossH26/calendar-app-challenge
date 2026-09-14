import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';
import { Constants } from '@utils/constants';
import { COMMON_IMPORTS } from '@shared/imports/common-imports';

@Component({
  selector: 'app-appointment-list',
  imports: [
    ...COMMON_IMPORTS
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentList {
    private readonly appointmentService = inject(AppointmentService);
    readonly appointments = signal<Appointment[]>([]);
    readonly searchTerm = input<string>(Constants.EMPTY_STRING);
    readonly refreshTrigger = input<number>(0);
    readonly editAppointment = output<Appointment>();
    readonly filteredAppointments = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();

        if (!term)
            return this.appointments();

        return this.appointments().filter((appointment) =>
            appointment.description.toLowerCase().includes(term) ||
            appointment.notes?.toLowerCase().includes(term)
        );
    });
    
    constructor() {
        effect(() => {
            this.refreshTrigger();
            this.loadAppointments();
        });
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

    openEditModal = (appointment: Appointment) => this.editAppointment.emit(appointment);

    openEditFromCard(appointment: Appointment): void {
        if (window.matchMedia('(max-width: 1024px)').matches)
            this.openEditModal(appointment);
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