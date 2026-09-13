import { AppointmentType } from "@models/appointment-type.model";

export interface Appointment {
  id: number;
  description: string;
  notes?: string;
  appointment_type_id: number;
  appointment_type?: AppointmentType;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
  updated_at?: string;
}