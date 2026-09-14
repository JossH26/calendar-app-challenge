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
import { ErrorHandler } from '@utils/error-handler/error-handler';
import { FormValidation } from '@utils/validations/form-validation';
import { COMMON_IMPORTS } from '@shared/imports/common-imports';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-appointment-modal',
  imports: [
    ...COMMON_IMPORTS,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule
  ],
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
        starts_at_date: FormControl<Date | null>;
        starts_at_time: FormControl<string>;
        ends_at_date: FormControl<Date | null>;
        ends_at_time: FormControl<string>;
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
            starts_at_date: this.formBuilder.control<Date | null>(
                this.getDateFromValue(this.appointment?.starts_at),
                Validators.required
            ),
            starts_at_time: this.formBuilder.nonNullable.control<string>(
                this.getTimeFromValue(this.appointment?.starts_at),
                Validators.required
            ),
            ends_at_date: this.formBuilder.control<Date | null>(
                this.getDateFromValue(this.appointment?.ends_at),
                Validators.required
            ),
            ends_at_time: this.formBuilder.nonNullable.control<string>(
                this.getTimeFromValue(this.appointment?.ends_at),
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
    
    private getDateFromValue(value?: string): Date | null {
        const dateValue = value?.slice(0, 10);

        if (!dateValue)
            return null;

        const [year, month, day] = dateValue.split('-').map(Number);

        return new Date(year, month - 1, day);
    }

    private getTimeFromValue(value?: string): string {
        return value ? value.slice(11, 16) : Constants.EMPTY_STRING;
    }

    getTimePickerValue(time: string): Date | null {
        if (!time)
            return null;

        const [hours, minutes] = time.split(':').map(Number);

        if (Number.isNaN(hours) || Number.isNaN(minutes))
            return null;

        return new Date(2000, 0, 1, hours, minutes);
    }

    setTimeValue(controlName: 'starts_at_time' | 'ends_at_time', time: Date | null): void {
        const formattedTime = time
            ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

            : Constants.EMPTY_STRING;

        this.form.controls[controlName].setValue(formattedTime);
    }
    private formatDateTime(date: Date, time: string): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}T${time}`;
    }

    private buildAppointmentRequest(): AppointmentRequest {
        const values = this.form.getRawValue();
        const request = {
            description: values.description,
            notes: values.notes,
            appointment_type_id: values.appointment_type_id,
            starts_at: this.formatDateTime(values.starts_at_date!, values.starts_at_time),
            ends_at: this.formatDateTime(values.ends_at_date!, values.ends_at_time),
            location: values.location,
            participants: values.participants
        };

        return request;
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

        const appointment = this.buildAppointmentRequest();

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

    getFieldError = (controlName: string, fieldName: string): string | null =>
        FormValidation.getMessage(
            this.form.get(controlName),
            fieldName
        );
}