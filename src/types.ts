export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  created_at: string;
  services?: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

export interface BusinessHours {
  id: string;
  weekday: number; // 0 = Sunday, 1 = Monday, etc.
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}

export interface BookedSlot {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}
