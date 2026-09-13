import { Routes } from '@angular/router';
import { AppointmentTypeList } from '@appointment-types/pages/appointment-type-list';
import { Appointments } from '@appointments/pages/appointments/appointments';
import { CalendarMonth } from '@appointments/pages/calendar/calendar-month';
import { Constants } from '@utils/constants';

export const routes: Routes = [
  {
    path: Constants.EMPTY_STRING,
    component: Appointments
  },
  {
    path: 'appointment-types',
    component: AppointmentTypeList
  }
];