
import type { Icon as FeatherIcon } from 'react-feather';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string; // Added bio to UserProfile
}

export type AvatarShape = 'circle' | 'square'; // Moved AvatarShape here

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled'; // For form and data
export type KanbanBoardStatus = 'To Do' | 'In Progress' | 'Done'; // For actual board columns

export interface TaskFileAttachment {
  id: string;
  name: string;
  url: string; // Could be a data URI for mock, or a path
  type: string; // e.g., 'image/png', 'application/pdf'
  size: number; // in bytes
}

// Updated Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string; // Text input for now
  dueDate?: string; // ISO date string
  startDate?: string; // ISO date string
  priority: TaskPriority;
  status: TaskStatus; // Use the richer status for data
  relatedClientId?: string;
  relatedBookingId?: string;
  category?: string; // Comma-separated string for tags
  attachments?: TaskFileAttachment[];
  reminderDate?: string; // ISO date string
  subtasks?: string; // Textarea for now
  colorTag?: string; // e.g., 'red-500', 'blue-500', or a semantic name like 'project-alpha'
  createdBy: string; // e.g., 'Admin User'
  createdAt: string; // ISO date string
  // columnId: string; // Retained if still planning direct Kanban column mapping, or derived from status
}


export interface KanbanColumn {
  id: string;
  title: KanbanBoardStatus; // Columns on board represent a subset of task statuses
  taskIds: string[];
}

export interface PhotographyPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  services: string[];
  imageUrl?: string;
  dataAiHint?: string;
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
  paymentDate: string;
  method?: string;
  status: PaymentStatus;
  description?: string;
}

export interface BookingActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor?: string;
  iconName?: keyof typeof import('react-feather');
}

export interface BookingDateTime {
  id: string;
  dateTime: string;
  note?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  packageId: string;
  packageName: string;
  bookingDates: BookingDateTime[];
  category?: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  payments?: Payment[];
  activityLog?: BookingActivityLogEntry[];
}
