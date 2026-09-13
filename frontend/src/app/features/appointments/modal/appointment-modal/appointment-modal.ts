import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AppointmentType } from '@models/appointment-type.model';
import { Appointment } from '@models/appointment.model';
import { AppointmentRequest } from '@requests/appointment-request';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentService } from '@services/appointment/appointment.service';
import { Constants } from '@utils/constants';
import { ErrorHandler } from '@utils/error-handler';

@Component({
  selector: 'app-appointment-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.html',
  styleUrl: './appointment-modal.scss'
})
export class AppointmentModal {
    private readonly formBuilder = inject(FormBuilder);
    private readonly appointmentTypeService = inject(AppointmentTypeService);
    readonly appointmentTypes = signal<AppointmentType[]>([]);
    private readonly appointmentService = inject(AppointmentService);
    readonly errorMessage = signal<string | null>(null);

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();
    @Input() appointment?: Appointment;

    form!: FormGroup<{
        description: FormControl<string>;
        notes: FormControl<string>;
        appointment_type_id: FormControl<number>;
        starts_at: FormControl<string>;
        ends_at: FormControl<string>;
        location: FormControl<string>;
        participants: FormControl<string>;
    }>;

    ngOnInit(): void {
        this.loadForm();
        this.loadAppointmentTypes();
    }

    private loadForm(): void {
        this.form = this.formBuilder.group({
            description: this.formBuilder.nonNullable.control<string>(
                this.appointment?.description ?? Constants.EMPTY_STRING,
                Validators.required
            ),
            notes: this.formBuilder.nonNullable.control<string>(
                this.appointment?.notes ?? Constants.EMPTY_STRING
            ),
            appointment_type_id: this.formBuilder.nonNullable.control<number>(
                this.appointment?.appointment_type_id ?? 0,
                [
                    Validators.required,
                    Validators.min(1)
                ]
            ),
            starts_at: this.formBuilder.nonNullable.control<string>(
                this.formatDateForInput(this.appointment?.starts_at),
                Validators.required
            ),
            ends_at: this.formBuilder.nonNullable.control<string>(
                this.formatDateForInput(this.appointment?.ends_at),
                Validators.required
            ),
            location: this.formBuilder.nonNullable.control(
                this.appointment?.location ?? Constants.EMPTY_STRING
            ),
            participants: this.formBuilder.nonNullable.control(
                this.appointment?.participants ?? Constants.EMPTY_STRING
            )
        });
    }
    
    private formatDateForInput(date?: string): string {
        if (!date)
            return Constants.EMPTY_STRING;

        return date.slice(0, 16);
    }

    closeModal() {
        this.form.reset();
        this.close.emit();
    }

    private loadAppointmentTypes = () =>
        this.appointmentTypeService.getAll().subscribe({
            next: (appointmentTypes) => {
                this.appointmentTypes.set(appointmentTypes);
            },
            error: (error) => {
                console.error('Error loading appointment types:', error);
            }
        });

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage.set(null);

        const appointment = this.form.getRawValue();

        if (this.appointment) {
            this.updateAppointment(appointment);
            return;
        }

        this.createAppointment(appointment);
    }

    private createAppointment = (appointment: AppointmentRequest) =>
        this.appointmentService.create(appointment).subscribe({
            next: () => {
                this.saved.emit();
            },
            error: (error) => {
                 this.errorMessage.set(
                    ErrorHandler.getMessage(error, 'Ocurrió un error al guardar la cita.')
                );
            }
        });

    private updateAppointment = (appointment: AppointmentRequest) => {
        if (!this.appointment)
            return;

        this.appointmentService
            .update(this.appointment.id, appointment)
            .subscribe({
            next: () => {
                this.saved.emit();
            },
            error: (error) => {
                 this.errorMessage.set(
                    ErrorHandler.getMessage(error, 'Ocurrió un error al actualizar la cita.')
                );
            }
        });
    }
}