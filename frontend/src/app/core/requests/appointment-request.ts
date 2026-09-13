export interface AppointmentRequest {
  description: string;
  notes?: string;
  appointment_type_id: number;
  starts_at: string;
  ends_at: string;
}