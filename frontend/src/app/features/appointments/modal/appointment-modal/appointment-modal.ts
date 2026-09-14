import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentType } from '@models/appointment-type.model';
import { Appointment } from '@models/appointment.model';
import { AppointmentRequest } from '@requests/appointment-request';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentService } from '@services/appointment/appointment.service';
import { Constants } from '@utils/constants';
import { ErrorHandler } from '@utils/error-handler/error-handler';
import { FormValidation } from '@utils/validations/form-validation';
import { COMMON_IMPORTS } from '@shared/imports/common-imports';

@Component({
  selector: 'app-appointment-modal',
  imports: [...COMMON_IMPORTS, MatDatepickerModule, MatNativeDateModule, MatTimepickerModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.html',
  styleUrl: './appointment-modal.scss'
})
export class AppointmentModal {
    private readonly formBuilder = inject(FormBuilder);
    private readonly appointmentTypeService = inject(AppointmentTypeService);
    private readonly appointmentService = inject(AppointmentService);
    readonly appointmentTypes = signal<AppointmentType[]>([]);
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
            description: this.formBuilder.nonNullable.control(
                this.appointment?.description ?? 
                Constants.EMPTY_STRING, FormValidation.requiredText),
            notes: this.formBuilder.nonNullable.control(
                this.appointment?.notes ?? 
                Constants.EMPTY_STRING),
            appointment_type_id: this.formBuilder.nonNullable.control(
                this.appointment?.appointment_type_id ?? 0, 
                [Validators.required, Validators.min(1)]),
            starts_at_date: this.formBuilder.control(this.getDateValue(
                this.appointment?.starts_at), 
                Validators.required),
            starts_at_time: this.formBuilder.nonNullable.control(
                this.getTimeValue(this.appointment?.starts_at), 
                Validators.required),
            ends_at_date: this.formBuilder.control(
                this.getDateValue(this.appointment?.ends_at), 
                Validators.required),
            ends_at_time: this.formBuilder.nonNullable.control(
                this.getTimeValue(this.appointment?.ends_at), 
                Validators.required),
            location: this.formBuilder.nonNullable.control(
                this.appointment?.location ?? 
                Constants.EMPTY_STRING),
            participants: this.formBuilder.nonNullable.control(
                this.appointment?.participants ?? 
                Constants.EMPTY_STRING)
        });
    }

    private getDateValue(value?: string): Date | null {
        if (!value)
            return null;

        const [year, month, day] = value.slice(0, 10).split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private getTimeValue = (value?: string): string => value?.slice(11, 16) ?? Constants.EMPTY_STRING;

    getTimePickerValue(time: string): Date | null {
        if (!time)
            return null;

        const [hours, minutes] = time.split(':').map(Number);
        return new Date(2000, 0, 1, hours, minutes);
    }

    setTimeValue(controlName: 'starts_at_time' | 'ends_at_time', time: Date | null): void {
        if (!time) {
            this.form.controls[controlName].setValue(Constants.EMPTY_STRING);
            return;
        }

        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        this.form.controls[controlName].setValue(`${hours}:${minutes}`);
    }

    private buildDateTime(date: Date | null, time: string): string {
        if (!date || !time)
            return Constants.EMPTY_STRING;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T${time}`;
    }

    closeModal() {
        this.form.reset();
        this.close.emit();
    }

    private loadAppointmentTypes = () => this.appointmentTypeService.getAll().subscribe({
        next: (types) => this.appointmentTypes.set(types),
        error: (error) => console.error('Error loading appointment types:', error)
    });

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage.set(null);
        const value = this.form.getRawValue();
        const appointment = {
            description: value.description.trim(),
            notes: value.notes.trim(),
            appointment_type_id: value.appointment_type_id,
            starts_at: this.buildDateTime(value.starts_at_date, value.starts_at_time),
            ends_at: this.buildDateTime(value.ends_at_date, value.ends_at_time),
            location: value.location.trim(),
            participants: value.participants.trim()
        };

        if (this.appointment) {
            this.updateAppointment(appointment);
            return;
        }

        this.createAppointment(appointment);
    }

    private createAppointment = (appointment: AppointmentRequest) => 
        this.appointmentService.create(appointment).subscribe({
        next: () => this.saved.emit(),
        error: (error) => this.errorMessage.set(ErrorHandler.getMessage(error, 'Ocurrió un error al guardar la cita.'))
    });

    private updateAppointment = (appointment: AppointmentRequest) => {
        if (!this.appointment)
            return;

        this.appointmentService.update(this.appointment.id, appointment).subscribe({
            next: () => this.saved.emit(),
            error: (error) => this.errorMessage.set(ErrorHandler.getMessage(error, 'Ocurrió un error al actualizar la cita.'))
        });
    };

    getFieldError = (controlName: string, fieldName: string): string | null =>
        FormValidation.getMessage(this.form.get(controlName), fieldName);
}
