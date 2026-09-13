import { environment } from '@environments/environment';

export const APIS_URL = {
  APPOINTMENT_TYPES: `${environment.apiUrl}/appointment_types`,
  APPOINTMENTS: `${environment.apiUrl}/appointments`
} as const;