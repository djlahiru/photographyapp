
import type { Icon as FeatherIcon } from 'react-feather';

export type CurrencyCode = 'LKR' | 'USD' | 'EUR';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  selectedCurrency?: CurrencyCode; // Added selectedCurrency
}

export type AvatarShape = 'circle' | 'square';
export type FontTheme = 'default-sans' | 'classic-serif' | 'modern-mono';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled';
export type KanbanBoardStatus = 'To Do' | 'In Progress' | 'Done';

export interface TaskFileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  startDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedClientId?: string;
  relatedBookingId?: string;
  category?: string;
  attachments?: TaskFileAttachment[];
  reminderDate?: string;
  subtasks?: string;
  colorTag?: string;
  createdBy: string;
  createdAt: string;
}


export interface KanbanColumn {
  id: string;
  title: KanbanBoardStatus;
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

export interface BookingCategory {
  id: string;
  name: string;
  gradientClasses: string;
  textColorClass: string;
}

export interface Booking {
  id: string;
  clientName: string;
  packageId: string;
  packageName: string;
  bookingDates: BookingDateTime[];
  categoryId?: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  payments?: Payment[];
  activityLog?: BookingActivityLogEntry[];
}

export type SpecialNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'default';

export interface SpecialNote {
  id: string;
  content: string;
  color: SpecialNoteColor;
  createdAt: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Recorded';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate?: string;
  status: InvoiceStatus;
}

