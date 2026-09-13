import { Routes } from '@angular/router';
import { AppointmentTypeList } from '@appointment-types/pages/appointment-type-list';
import { AppointmentList } from '@appointments/pages/appointment-list/appointment-list';
import { CalendarMonth } from '@appointments/pages/calendar/calendar-month';
import { Constants } from '@utils/constants';

export const routes: Routes = [
  {
    path: Constants.EMPTY_STRING,
    component: AppointmentList
  },
  {
    path: 'appointment-types',
    component: AppointmentTypeList
  },
  {
    path: 'calendar',
    component: CalendarMonth
  }
];