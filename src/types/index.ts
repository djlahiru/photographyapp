
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

export interface Booking {
  id: string;
  client: Client;
  package: PhotographyPackage;
  bookingDate: string; // ISO date string
  category?: string;
  status: BookingStatus;
  notes?: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string; // ISO date string
  method?: string; // e.g., 'Credit Card', 'Bank Transfer'
}
