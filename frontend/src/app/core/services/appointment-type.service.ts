import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentType } from '@models/appointment-type.model';
import { APIS_URL } from '@environments/apis-url';

@Injectable({
  providedIn: 'root'
})
export class AppointmentTypeService {
  private readonly http = inject(HttpClient);

  getAll = (): Observable<AppointmentType[]> =>
    this.http.get<AppointmentType[]>(APIS_URL.APPOINTMENT_TYPES);

  create = (appointmentType: Partial<AppointmentType>): Observable<AppointmentType> =>
    this.http.post<AppointmentType>(
        APIS_URL.APPOINTMENT_TYPES,
        { appointment_type: appointmentType }
    );
}