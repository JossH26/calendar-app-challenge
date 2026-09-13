import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Appointment } from '@models/appointment.model';
import { APIS_URL } from '@environments/apis-url';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);

  getAll = (): Observable<Appointment[]> =>
    this.http.get<Appointment[]>(APIS_URL.APPOINTMENTS);
}