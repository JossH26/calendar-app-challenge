import { Component, inject, signal } from '@angular/core';
import { AppointmentModal } from '@appointments/modal/appointment-modal/appointment-modal';
import { Appointment } from '@models/appointment.model';
import { AppointmentService } from '@services/appointment/appointment.service';
import { COMMON_IMPORTS } from '@shared/imports/common-imports';
import { Constants } from '@utils/constants';
import { months } from '@catalogs/months';

@Component({
    selector: 'app-calendar-month',
    imports: [
        ...COMMON_IMPORTS,
        AppointmentModal
    ],
    templateUrl: './calendar-month.html',
    styleUrl: './calendar-month.scss'
})
export class CalendarMonth {
    private readonly appointmentService = inject(AppointmentService);
    readonly appointments = signal<Appointment[]>([]);
    readonly currentDate = signal(new Date());
    readonly days = signal<(Date | null)[]>([]);
    readonly isModalOpen = signal(false);
    readonly selectedAppointment = signal<Appointment | undefined>(undefined);
    readonly months = months;
    readonly years = Array.from(
        { length: 11 },
        (_, index) => new Date().getFullYear() - 5 + index
    );

    constructor() {
        this.loadMonthDays();
    }

    ngOnInit(): void {
        this.loadMonthDays();
        this.loadAppointments();
    }

    private loadMonthDays(): void {
        var date = this.currentDate();
        var year = date.getFullYear();
        var month = date.getMonth();
        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0).getDate();
        var days: (Date | null)[] = [];
        var initialEmptyDays = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < initialEmptyDays; i++)
            days.push(null);

        for (let day = 1; day <= lastDay; day++)
            days.push(new Date(year, month, day));

        this.days.set(days);
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

    getAppointmentsByDay(day: Date): Appointment[] {
        return this.appointments().filter((appointment) => {
            if (!appointment.starts_at)
                return false;

            const appointmentDate = new Date(appointment.starts_at);

            return (
                appointmentDate.getFullYear() === day.getFullYear() &&
                appointmentDate.getMonth() === day.getMonth() &&
                appointmentDate.getDate() === day.getDate()
            );
        });
    }

    openEditModal(appointment: Appointment): void {
        this.selectedAppointment.set(appointment);
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
        this.selectedAppointment.set(undefined);
    }

    onSaved(): void {
        this.closeModal();
        this.loadAppointments();
    }

    getAppointmentTooltip(appointment: Appointment): string {
        var start = appointment.starts_at
            ? new Date(appointment.starts_at).toLocaleString()
            : Constants.EMPTY_STRING;

        var end = appointment.ends_at
            ? new Date(appointment.ends_at).toLocaleString()
            : Constants.EMPTY_STRING;

        var location = appointment.location
            ? `Ubicación: ${appointment.location}\n`
            : Constants.EMPTY_STRING;

        return [
            appointment.description,
            `Tipo: ${appointment.appointment_type?.name ?? Constants.EMPTY_STRING}`,
            `Inicio: ${start}`,
            `Fin: ${end}`,
            location,
            appointment.notes ? `Notas: ${appointment.notes}` : Constants.EMPTY_STRING
        ]
        .filter(Boolean)
        .join('\n');
    }

    deleteAppointment(event: Event, id: number): void {
        event.stopPropagation();

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

    previousMonth() {
        const current = this.currentDate();

        this.currentDate.set(
            new Date(
            current.getFullYear(),
            current.getMonth() - 1,
            1
            )
        );

        this.loadMonthDays();
    }

    nextMonth() {
        const current = this.currentDate();

        this.currentDate.set(
            new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            1
            )
        );

        this.loadMonthDays();
    }

    goToToday() {
        this.currentDate.set(new Date());
        this.loadMonthDays();
    }

    changeMonth(month: number): void {
        const current = this.currentDate();

        this.currentDate.set(
            new Date(
            current.getFullYear(),
            month,
            1
            )
        );

        this.loadMonthDays();
    }


    changeYear(year: number): void {
        const current = this.currentDate();

        this.currentDate.set(
            new Date(
            year,
            current.getMonth(),
            1
            )
        );

        this.loadMonthDays();
    }
}