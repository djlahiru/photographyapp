
import type { LucideIcon } from 'lucide-react';

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
}

export interface Client {
  id:string;
  name: string;
  contactDetails: {
    phone?: string;
    email?: string;
  };
  address?: string;
  totalPayments: number;
  outstandingBalance: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface BookingActivityLogEntry {
  id: string;
  timestamp: string; // ISO date string
  action: string; // e.g., "Booking confirmed", "Payment of $50 received", "Status updated to Completed"
  actor?: string; // e.g., "System", "Admin", "Client Name" (optional)
  iconName?: keyof typeof import('lucide-react'); // Name of the Lucide icon
}

export interface Booking {
  id: string;
  client: Client; // For simplicity, we'll use clientName directly on mock data for now
  clientName: string; // Keep for mock data simplicity as client object is not fully mocked
  packageName: string;
  bookingDate: string; // ISO date string
  category?: string;
  status: BookingStatus;
  notes?: string;
  payments?: Payment[]; // Optional for now, assuming payments might be part of activity log too
  activityLog?: BookingActivityLogEntry[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string; // ISO date string
  method?: string; // e.g., 'Credit Card', 'Bank Transfer'
}
