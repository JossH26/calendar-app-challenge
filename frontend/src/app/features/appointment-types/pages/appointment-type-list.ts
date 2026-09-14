import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppointmentTypeModal } from '@appointment-types-modal/appointment-type-modal';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';

@Component({
    selector: 'app-appointment-type-list',
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        AppointmentTypeModal
    ],
    templateUrl: './appointment-type-list.html',
    styleUrl: './appointment-type-list.scss'
})
export class AppointmentTypeList implements OnInit {
    private readonly appointmentTypeService = inject(AppointmentTypeService);
    readonly appointmentTypes = signal<AppointmentType[]>([]);
    readonly isListModalOpen = signal(true);
    readonly isModalOpen = signal(false);
    readonly selectedAppointmentType = signal<AppointmentType | undefined>(undefined);

    ngOnInit(): void {
        this.loadAppointmentTypes();
    }

    private loadAppointmentTypes(onLoaded?: () => void): void {
        this.appointmentTypeService.getAll().subscribe({
            next: (appointmentTypes) => {
                this.appointmentTypes.set(appointmentTypes);
                onLoaded?.();
            },
            error: (error) => {
                console.error('Error loading appointment types:', error);
            }
        });
    }

    openCreateModal(): void {
        this.selectedAppointmentType.set(undefined);
        this.isListModalOpen.set(false);
        this.isModalOpen.set(true);
    }

    openEditModal(appointmentType: AppointmentType): void {
        this.selectedAppointmentType.set(appointmentType);
        this.isListModalOpen.set(false);
        this.isModalOpen.set(true);
    }

    openModal = () => this.isListModalOpen.set(true);

    closeListModal(): void {
        this.isListModalOpen.set(false);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
        this.selectedAppointmentType.set(undefined);
        this.isListModalOpen.set(true);
    }

    onSaved(): void {
        this.isModalOpen.set(false);
        this.selectedAppointmentType.set(undefined);
        this.loadAppointmentTypes(() => this.isListModalOpen.set(true));
    }

    deleteAppointmentType(id: number): void {
        const confirmed = confirm('¿Deseas eliminar este tipo de cita?');

        if (!confirmed)
            return;

        this.appointmentTypeService.delete(id).subscribe({
            next: () => {
                this.loadAppointmentTypes();
            },
            error: (error) => {
                console.error('Error deleting appointment type:', error);
            }
        });
    }
}
