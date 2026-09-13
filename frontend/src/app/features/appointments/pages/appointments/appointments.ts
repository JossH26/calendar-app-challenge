import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AppointmentList } from '@appointments/pages/appointment-list/appointment-list';
import { CalendarMonth } from '@appointments/pages/calendar/calendar-month';

type AppointmentView = 'list' | 'calendar';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentList,
    CalendarMonth
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments {
  readonly selectedView = signal<AppointmentView>('list');

  showList = () =>
    this.selectedView.set('list');

  showCalendar = () =>
    this.selectedView.set('calendar');
}