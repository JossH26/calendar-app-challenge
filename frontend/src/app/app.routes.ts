import { Routes } from '@angular/router';
import { AppointmentTypeList } from '@appointment-types/pages/appointment-type-list';

export const routes: Routes = [
  {
    path: 'appointment-types',
    component: AppointmentTypeList
  },
  {
    path: '',
    redirectTo: 'appointment-types',
    pathMatch: 'full'
  }
];