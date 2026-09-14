import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeService } from '@services/appointment-type.service';
import { Constants } from '@utils/constants';
import { FormValidation } from '@utils/validations/form-validation';

const DEFAULT_APPOINTMENT_TYPE_COLOR = '#D1D5DB';

@Component({
  selector: 'app-appointment-type-modal',
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './appointment-type-modal.html',
  styleUrl: './appointment-type-modal.scss'
})
export class AppointmentTypeModal {
    private readonly formBuilder = inject(FormBuilder);
    private readonly appointmentTypeService = inject(AppointmentTypeService);

    readonly predefinedColors = [
        { name: 'Rojo', value: '#EF4444' },
        { name: 'Azul', value: '#3B82F6' },
        { name: 'Verde', value: '#22C55E' },
        { name: 'Morado', value: '#A855F7' },
        { name: 'Amarillo', value: '#EAB308' }
    ];
    readonly maxCustomColors = 5;
    readonly customColors = signal<string[]>([]);
    readonly customColorDraft = signal<string | undefined>(undefined);

    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();
    @Input() appointmentType?: AppointmentType;

    form!: FormGroup<{
        name: FormControl<string>;
        color: FormControl<string>;
    }>;

    ngOnInit(): void {
        this.loadForm();
    }

    private loadForm(): void {
        const color = this.appointmentType?.color ?? Constants.EMPTY_STRING;

        this.customColors.set([]);
        this.customColorDraft.set(undefined);
        this.form = this.formBuilder.group({
            name: this.formBuilder.nonNullable.control(
                this.appointmentType?.name ?? Constants.EMPTY_STRING, FormValidation.requiredText),
            color: this.formBuilder.nonNullable.control(color)
        });

        if (color && !this.isPredefinedColor(color))
            this.customColors.set([color]);
    }

    selectPredefinedColor(color: string) {
        this.customColorDraft.set(undefined);
        this.form.controls.color.setValue(color);
    }

    beginCustomColorSelection = () =>
        this.customColorDraft.set(this.form.controls.color.value || '#000000');

    updateCustomColorDraft = (color: string) => this.customColorDraft.set(color);

    confirmCustomColor(): void {
        const color = this.customColorDraft();

        if (!color)
            return;

        if (this.isPredefinedColor(color)) {
            this.selectPredefinedColor(color);
            return;
        }

        const customColors = this.customColors();

        if (!customColors.includes(color)) {
            if (customColors.length === this.maxCustomColors) {
                this.customColorDraft.set(undefined);
                return;
            }

            this.customColors.set([...customColors, color]);
        }

        this.selectCustomColor(color);
        this.customColorDraft.set(undefined);
    }

    selectCustomColor = (color: string) => this.form.controls.color.setValue(color);

    isSelectedColor = (color: string): boolean => this.form.controls.color.value === color;

    isCustomColorSelected = (color: string): boolean =>
        this.isSelectedColor(color) && this.customColors().includes(color);

    private isPredefinedColor = (color: string): boolean =>
        this.predefinedColors.some((predefinedColor) => predefinedColor.value === color);

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const name = this.form.controls.name.value;
        const color = this.form.controls.color.value || DEFAULT_APPOINTMENT_TYPE_COLOR;

        if (this.appointmentType) {
            this.updateAppointmentType(name, color);
            return;
        }

        this.createAppointmentType(name, color);
    }

    private createAppointmentType = (name: string, color: string) =>
        this.appointmentTypeService.create({ name, color }).subscribe({
            next: () => this.saved.emit(),
            error: (error) => console.error('Error creating appointment type:', error)
        });

    private updateAppointmentType(name: string, color: string) {
        if (!this.appointmentType)
            return;

        this.appointmentTypeService.update(this.appointmentType.id, { name, color }).subscribe({
            next: () => this.saved.emit(),
            error: (error) => console.error('Error updating appointment type:', error)
        });
    }

    closeModal() {
        this.customColors.set([]);
        this.customColorDraft.set(undefined);
        this.form.reset();
        this.close.emit();
    }

    get modalTitle(): string {
        return this.appointmentType ? 'Editar tipo de cita' : 'Nuevo tipo de cita';
    }
}