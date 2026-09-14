import { Component, signal } from '@angular/core';
import { AppointmentList } from '@appointments/pages/appointment-list/appointment-list';
import { CalendarMonth } from '@appointments/pages/calendar/calendar-month';
import { AppointmentModal } from '@appointments/modal/appointment-modal/appointment-modal';
import { COMMON_IMPORTS } from '@shared/imports/common-imports';
import { Constants } from '@utils/constants';

type AppointmentView = 'list' | 'calendar';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    ...COMMON_IMPORTS,
    AppointmentList,
    CalendarMonth,
    AppointmentModal
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments {
  readonly selectedView = signal<AppointmentView>('list');
  readonly searchTerm = signal<string>(Constants.EMPTY_STRING);
  readonly isCreateModalOpen = signal(false);
  readonly refreshAppointments = signal(0);

  showList = () => this.selectedView.set('list');

  showCalendar = () => this.selectedView.set('calendar');

  openCreateModal = () => this.isCreateModalOpen.set(true);

  closeCreateModal = () => this.isCreateModalOpen.set(false);

  onCreated(): void {
    this.closeCreateModal();
    this.refreshAppointments.update(value => value + 1);
  }
}