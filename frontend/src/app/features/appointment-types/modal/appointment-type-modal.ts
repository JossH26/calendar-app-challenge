import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { Constants } from '@utils/constants';

@Component({
  selector: 'app-appointment-type-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-type-modal.html',
  styleUrl: './appointment-type-modal.scss'
})
export class AppointmentTypeModal {
    private readonly formBuilder = inject(FormBuilder);
    private readonly appointmentTypeService = inject(AppointmentTypeService);

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();
    @Input() appointmentType?: AppointmentType;
    form!: FormGroup<{ name: FormControl<string>; }>;

    ngOnInit(): void {
        this.loadForm();
    }

    private loadForm() {
        this.form = this.formBuilder.group({
            name: this.formBuilder.nonNullable.control(
                this.appointmentType?.name ?? Constants.EMPTY_STRING, Validators.required)
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const name = this.form.controls.name.value;

        if (this.appointmentType) {
            this.updateAppointmentType(name);
            return;
        }

        this.createAppointmentType(name);
    }

    private createAppointmentType = (name: string) =>
        this.appointmentTypeService.create({ name }).subscribe({
            next: () => {
                this.saved.emit();
            },
            error: (error) => {
                console.error('Error creating appointment type:', error);
            }
        });

    private updateAppointmentType(name: string) {
        if (!this.appointmentType)
            return;

        this.appointmentTypeService
            .update(this.appointmentType.id, { name })
            .subscribe({
                next: () => {
                    this.saved.emit();
                },
                error: (error) => {
                    console.error('Error updating appointment type:', error);
                }
            });
    }

    closeModal(): void {
        this.form.reset();
        this.close.emit();
    }

    get modalTitle(): string {
        return this.appointmentType
            ? 'Editar tipo de cita'
            : 'Nuevo tipo de cita';
    }
}