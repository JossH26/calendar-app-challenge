import { environment } from '@environments/environment';

export const APIS_URL = {
  APPOINTMENT_TYPES: `${environment.apiUrl}/appointment_types`
} as const;