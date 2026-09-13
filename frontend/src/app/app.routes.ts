import { Routes } from '@angular/router';
import { AppointmentTypeList } from '@appointment-types/pages/appointment-type-list';
import { Constants } from '@utils/constants';

export const routes: Routes = [
  {
    path: 'appointment-types',
    component: AppointmentTypeList
  },
  {
    path: Constants.EMPTY_STRING,
    redirectTo: 'appointment-types',
    pathMatch: 'full'
  }
];