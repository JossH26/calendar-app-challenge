import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

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

  readonly form = this.formBuilder.group({
    name: [Constants.EMPTY_STRING, Validators.required]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.controls.name.value ?? Constants.EMPTY_STRING;

    this.appointmentTypeService.create({ name }).subscribe({
      next: () => {
        this.form.reset();
        this.saved.emit();
      },
      error: (error) => {
        console.error('Error creating appointment type:', error);
      }
    });
  }

  closeModal(): void {
    this.form.reset();
    this.close.emit();
  }
}