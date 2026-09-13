import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '@models/appointment.model';
import { APIS_URL } from '@environments/apis-url';
import { AppointmentRequest } from '@requests/appointment-request';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);

  getAll = (): Observable<Appointment[]> =>
    this.http.get<Appointment[]>(APIS_URL.APPOINTMENTS);

  create = (appointment: AppointmentRequest): Observable<Appointment> =>
    this.http.post<Appointment>(
      APIS_URL.APPOINTMENTS,
      { appointment }
    );

  update = (id: number, appointment: AppointmentRequest): Observable<Appointment> =>
    this.http.patch<Appointment>(
      `${APIS_URL.APPOINTMENTS}/${id}`,
      { appointment }
    );

  delete = (id: number): Observable<void> =>
    this.http.delete<void>(
      `${APIS_URL.APPOINTMENTS}/${id}`
    );
}