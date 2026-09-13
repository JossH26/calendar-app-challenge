import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentTypeModal } from '@appointment-types-modal/appointment-type-modal';

@Component({
    selector: 'app-appointment-type-list',
    imports: [
        CommonModule,
        AppointmentTypeModal
    ],
    templateUrl: './appointment-type-list.html',
    styleUrl: './appointment-type-list.scss'
})
export class AppointmentTypeList implements OnInit {
    private readonly appointmentTypeService = inject(AppointmentTypeService);
    readonly appointmentTypes = signal<AppointmentType[]>([]);
    readonly isModalOpen = signal(false);
    readonly selectedAppointmentType = signal<AppointmentType | undefined>(undefined);

    ngOnInit(): void {
        this.loadAppointmentTypes();
    }

    private loadAppointmentTypes() {
        this.appointmentTypeService.getAll().subscribe({
            next: (appointmentTypes) => {
                this.appointmentTypes.set(appointmentTypes);
            },
            error: (error) => {
                console.error('Error loading appointment types:', error);
            }
        });
    }

    openCreateModal() {
        this.selectedAppointmentType.set(undefined);
        this.isModalOpen.set(true);
    }

    openEditModal(appointmentType: AppointmentType) {
        this.selectedAppointmentType.set(appointmentType);
        this.isModalOpen.set(true);
    }

    openModal = () => this.isModalOpen.set(true);

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedAppointmentType.set(undefined);
    }
    onSaved() {
        this.closeModal();
        this.loadAppointmentTypes();
    }
}