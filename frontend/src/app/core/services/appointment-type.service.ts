import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentType } from '@models/appointment-type.model';
import { AppointmentTypeRequest } from '@requests/appointment-type-request';
import { APIS_URL } from '@environments/apis-url';

@Injectable({
  providedIn: 'root'
})
export class AppointmentTypeService {
  private readonly http = inject(HttpClient);

    getAll = (): Observable<AppointmentType[]> =>
        this.http.get<AppointmentType[]>(APIS_URL.APPOINTMENT_TYPES);

    create = (appointmentType: AppointmentTypeRequest): Observable<AppointmentType> =>
        this.http.post<AppointmentType>(
            APIS_URL.APPOINTMENT_TYPES,
            { appointment_type: appointmentType }
        );

    update = (id: number, appointmentType: AppointmentTypeRequest): Observable<AppointmentType> =>
        this.http.patch<AppointmentType>(
            `${APIS_URL.APPOINTMENT_TYPES}/${id}`,
            { appointment_type: appointmentType }
        );

    delete = (id: number): Observable<void> =>
        this.http.delete<void>(
            `${APIS_URL.APPOINTMENT_TYPES}/${id}`
        );
}