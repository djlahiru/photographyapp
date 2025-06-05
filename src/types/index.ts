
import type { Icon as FeatherIcon } from 'react-feather';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: UserProfile;
  dueDate?: string; // ISO date string
  status: 'To Do' | 'In Progress' | 'Done';
  columnId: string; // To link with Kanban columns
}

export interface KanbanColumn {
  id: string;
  title: string;
  taskIds: string[];
}

export interface PhotographyPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  services: string[]; // Array of service descriptions
  imageUrl?: string; // Added for package image
  dataAiHint?: string; // Added for AI hint for package image
}

export interface Client {
  id:string;
  name: string;
  contactDetails: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  address?: string;
  avatarUrl?: string;
  dataAiHint?: string;
  notes?: string;
  totalPayments: number;
  outstandingBalance: number;
  totalBookings: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string; // ISO date string
  method?: string; // e.g., 'Credit Card', 'Bank Transfer'
  status: PaymentStatus;
  description?: string; // e.g., "Deposit for Wedding Package"
}

export interface BookingActivityLogEntry {
  id: string;
  timestamp: string; // ISO date string
  action: string; // e.g., "Booking confirmed", "Payment of $50 received", "Status updated to Completed"
  actor?: string; // e.g., "System", "Admin", "Client Name" (optional)
  iconName?: keyof typeof import('react-feather');
}

export interface BookingDateTime {
  id: string; // Unique ID for this date/time entry, e.g., for React keys
  dateTime: string; // ISO date string or format compatible with datetime-local
}

export interface Booking {
  id: string;
  clientName: string;
  packageId: string;
  packageName: string;
  bookingDates: BookingDateTime[]; // Changed from single bookingDate
  category?: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  payments?: Payment[];
  activityLog?: BookingActivityLogEntry[];
}
