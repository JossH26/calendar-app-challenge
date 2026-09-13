import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { AppointmentService } from '@services/appointment/appointment.service';
import { Constants } from '@utils/constants';

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

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup<{
    description: FormControl<string>;
    notes: FormControl<string>;
    appointment_type_id: FormControl<number>;
    starts_at: FormControl<string>;
    ends_at: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.loadForm();
    this.loadAppointmentTypes();
    }

  private loadForm(): void {
        this.form = this.formBuilder.group({
            description: this.formBuilder.nonNullable.control<string>(
                Constants.EMPTY_STRING,
                Validators.required
            ),
            notes: this.formBuilder.nonNullable.control<string>(
                Constants.EMPTY_STRING
            ),
            appointment_type_id: this.formBuilder.nonNullable.control<number>(
                0,
                Validators.required
            ),
            starts_at: this.formBuilder.nonNullable.control<string>(
                Constants.EMPTY_STRING,
                Validators.required
            ),
            ends_at: this.formBuilder.nonNullable.control<string>(
                Constants.EMPTY_STRING,
                Validators.required
            )
        });
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

        const appointment = this.form.getRawValue();

        this.appointmentService.create(appointment).subscribe({
            next: () => {
                this.saved.emit();
            },
            error: (error) => {
                console.error('Error creating appointment:', error);
            }
        });
    }
}