
import type { PhotographyPackage, Client, Booking, BookingStatus, PaymentStatus, BookingActivityLogEntry, BookingDateTime, Task, TaskPriority, TaskStatus, SpecialNote, SpecialNoteColor, BookingCategory } from '@/types';

// --- INITIAL MOCK DATA (DEEP COPIED & FROZEN) ---

const initialMockBookingCategoriesData: ReadonlyArray<BookingCategory> = Object.freeze(JSON.parse(JSON.stringify([
  { id: "cat-wedding", name: "Wedding", gradientClasses: "bg-gradient-to-br from-pink-400 to-red-500", textColorClass: "text-white" },
  { id: "cat-portrait", name: "Portrait", gradientClasses: "bg-gradient-to-br from-sky-400 to-cyan-500", textColorClass: "text-white" },
  { id: "cat-family", name: "Family", gradientClasses: "bg-gradient-to-br from-emerald-400 to-teal-500", textColorClass: "text-white" },
  { id: "cat-event", name: "Event", gradientClasses: "bg-gradient-to-br from-amber-400 to-yellow-500", textColorClass: "text-black" },
  { id: "cat-commercial", name: "Commercial", gradientClasses: "bg-gradient-to-br from-slate-500 to-gray-600", textColorClass: "text-white" },
  { id: "cat-maternity", name: "Maternity", gradientClasses: "bg-gradient-to-br from-purple-400 to-indigo-500", textColorClass: "text-white" },
  { id: "cat-newborn", name: "Newborn", gradientClasses: "bg-gradient-to-br from-rose-300 to-pink-300", textColorClass: "text-black" },
])));

const initialMockPackagesData: ReadonlyArray<PhotographyPackage> = Object.freeze(JSON.parse(JSON.stringify([
  { id: "1", name: "Basic Portrait Session", description: "A quick session for individual portraits, perfect for headshots or a small update.", price: 150, services: ["30 min session", "5 edited photos", "Online gallery access"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "portrait photography" },
  { id: "2", name: "Standard Wedding Package", description: "Comprehensive wedding day coverage from getting ready to the first dance.", price: 2500, services: ["8 hours coverage", "2 photographers", "Online gallery", "300+ edited photos", "Engagement session discount"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "wedding event" },
  { id: "3", name: "Family Lifestyle Shoot", description: "Capture natural family moments in a relaxed outdoor or in-home setting.", price: 350, services: ["1 hour session", "Outdoor or in-home", "50 edited photos", "Print release"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "family photoshoot" },
  { id: "4", name: "Event Photography", description: "Coverage for corporate events, parties, or other special occasions.", price: 600, services: ["Up to 3 hours coverage", "Online gallery", "All usable photos delivered"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "corporate event" },
])));

const initialMockClientsData: ReadonlyArray<Client> = Object.freeze(JSON.parse(JSON.stringify([
  { id: "client-1", name: "Alice Wonderland", contactDetails: { email: "alice@example.com", phone: "555-1234", whatsapp: "555-1234" }, address: "123 Storybook Lane", totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "female person", notes: "Prefers morning shoots. Allergic to cats." },
  { id: "client-2", name: "Bob The Builder", contactDetails: { email: "bob@example.com", phone: "555-5678" }, address: "456 Construction Rd", totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "male person", notes: "Needs invoices sent to accounting@bobcorp.com." },
  { id: "client-3", name: "Charlie Chaplin", contactDetails: { email: "charlie@example.com" }, totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "classic actor", notes: "" },
  { id: "client-4", name: "Diana Prince", contactDetails: { email: "diana@example.com" }, totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "heroine woman", notes: "" },
])));

const initialMockBookingsData: ReadonlyArray<Booking> = Object.freeze(JSON.parse(JSON.stringify([
  {
    id: "booking-1",
    clientName: "Alice Wonderland",
    packageName: "Basic Portrait Session",
    packageId: "1",
    bookingDates: [{ id: 'dt1_1', dateTime: "2024-08-15T14:00:00Z", note: "Focus on professional headshots." }],
    categoryId: "cat-portrait",
    status: "Confirmed" as BookingStatus,
    price: 150,
    payments: [
      { id: "p1a", bookingId: "booking-1", amount: 75, paymentDate: "2024-08-02T11:30:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Deposit" },
      { id: "p1b", bookingId: "booking-1", amount: 75, paymentDate: "2024-08-14T10:00:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Final Payment" }
    ],
    activityLog: [
      { id: "log1a", timestamp: "2024-08-01T10:00:00Z", action: "Booking created by Alice Wonderland.", actor: "Alice Wonderland", iconName: "PlusCircle" },
      { id: "log1b", timestamp: "2024-08-02T11:30:00Z", action: "Payment of $75 received (Deposit).", actor: "System", iconName: "DollarSign" },
      { id: "log1c", timestamp: "2024-08-03T14:15:00Z", action: "Booking status changed to Confirmed.", actor: "Admin", iconName: "CheckCircle" },
      { id: "log1d", timestamp: "2024-08-14T09:00:00Z", action: "Reminder email sent to client.", actor: "System", iconName: "Mail" },
      { id: "log1e", timestamp: "2024-08-14T10:00:00Z", action: "Final payment of $75 received.", actor: "System", iconName: "DollarSign" },
    ]
  },
  {
    id: "booking-2",
    clientName: "Bob The Builder",
    packageName: "Standard Wedding Package",
    packageId: "2",
    bookingDates: [{ id: 'dt2_1', dateTime: "2024-09-20T10:30:00Z", note: "Ceremony at City Hall, reception at The Grand Ballroom." }],
    categoryId: "cat-wedding",
    status: "Completed" as BookingStatus,
    price: 2500,
    payments: [
      { id: "p2a", bookingId: "booking-2", amount: 1000, paymentDate: "2024-07-10T10:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Initial Deposit" },
      { id: "p2b", bookingId: "booking-2", amount: 1500, paymentDate: "2024-09-15T14:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Final Balance" }
    ],
    activityLog: [
        { id: "log2a", timestamp: "2024-07-01T10:00:00Z", action: "Booking created by Bob The Builder.", actor: "Bob The Builder", iconName: "PlusCircle" },
        { id: "log2b", timestamp: "2024-07-10T10:00:00Z", action: "Payment of $1000 received (Initial Deposit).", actor: "System", iconName: "DollarSign" },
        { id: "log2c", timestamp: "2024-09-15T14:00:00Z", action: "Final payment of $1500 received.", actor: "System", iconName: "DollarSign" },
        { id: "log2d", timestamp: "2024-09-21T10:00:00Z", action: "Booking status changed to Completed.", actor: "Admin", iconName: "CheckCircle" },
    ]
  },
  {
    id: "booking-3",
    clientName: "Charlie Chaplin",
    packageName: "Family Lifestyle Shoot",
    packageId: "3",
    bookingDates: [{ id: 'dt3_1', dateTime: "2024-07-30T16:00:00Z" }],
    categoryId: "cat-family",
    status: "Pending" as BookingStatus,
    price: 350,
    payments: [
      { id: "p3a", bookingId: "booking-3", amount: 100, paymentDate: "2024-07-20T12:00:00Z", method: "PayPal", status: "Pending" as PaymentStatus, description: "Deposit" }
    ],
    activityLog: [
        { id: "log3a", timestamp: "2024-07-19T10:00:00Z", action: "Booking created.", actor: "Charlie Chaplin", iconName: "PlusCircle" },
        { id: "log3b", timestamp: "2024-07-20T12:00:00Z", action: "Deposit payment of $100 initiated.", actor: "System", iconName: "DollarSign" },
    ]
  },
  {
    id: "booking-4",
    clientName: "Diana Prince",
    packageName: "Basic Portrait Session",
    packageId: "1",
    bookingDates: [{ id: 'dt4_1', dateTime: "2024-08-05T09:00:00Z", note: "Client requested a very specific studio background." }],
    categoryId: "cat-portrait",
    status: "Cancelled" as BookingStatus,
    price: 150,
    activityLog: [
       { id: "log4a", timestamp: "2024-07-20T10:00:00Z", action: "Booking requested.", actor: "Diana Prince", iconName: "FilePlus" },
       { id: "log4b", timestamp: "2024-07-28T16:00:00Z", action: "Booking cancelled by client.", actor: "Diana Prince", iconName: "XCircle" },
    ]
  },
  {
    id: "booking-5",
    clientName: "Alice Wonderland",
    packageName: "Family Lifestyle Shoot",
    packageId: "3",
    bookingDates: [
        { id: 'dt5_1', dateTime: "2024-10-10T10:00:00Z", note: "Park session, bring picnic blanket." },
        { id: 'dt5_2', dateTime: "2024-10-12T15:00:00Z", note: "Rain date backup." }
    ],
    categoryId: "cat-family",
    status: "Pending" as BookingStatus,
    price: 350,
    payments: [],
    activityLog: [
      { id: "log5a", timestamp: "2024-09-25T10:00:00Z", action: "Booking created.", actor: "Admin", iconName: "PlusCircle" },
    ]
  }
])));

const initialMockTasksData: ReadonlyArray<Task> = Object.freeze(JSON.parse(JSON.stringify([
  {
    id: "task-1",
    title: "Edit Album - Johnson Wedding",
    description: "Finalize edits for Johnson wedding album. Client review scheduled for next week.",
    assignee: "Admin User",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
    startDate: new Date().toISOString(),
    priority: "High" as TaskPriority,
    status: "In Progress" as TaskStatus,
    relatedClientId: "client-2",
    relatedBookingId: "booking-2",
    category: "Editing,Post-Production",
    subtasks: "1. Cull images\n2. Color correction\n3. Retouching\n4. Album layout",
    colorTag: "blue",
    createdBy: "Admin User",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Send Payment Reminder - Alice Wonderland",
    description: "Alice's Family Lifestyle Shoot (booking-5) has an outstanding balance.",
    assignee: "Admin User",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
    priority: "Medium" as TaskPriority,
    status: "To Do" as TaskStatus,
    relatedClientId: "client-1",
    relatedBookingId: "booking-5",
    category: "Admin,Finance",
    createdBy: "Admin User",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Scout Location for upcoming Portrait Session",
    description: "Find a suitable outdoor location for Charlie Chaplin's portrait session. Consider good lighting for late afternoon.",
    assignee: "Admin User",
    priority: "Medium" as TaskPriority,
    status: "Waiting" as TaskStatus,
    relatedClientId: "client-3",
    category: "Pre-Production,Location Scouting",
    createdBy: "Admin User",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
])));

const initialMockSpecialNotesData: ReadonlyArray<SpecialNote> = Object.freeze(JSON.parse(JSON.stringify([
  {
    id: "note-1",
    content: "Remember to follow up with all clients from last week's expo by Friday!",
    color: "pink" as SpecialNoteColor,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-2",
    content: "Order new batch of photo paper and ink cartridges. Running low.",
    color: "yellow" as SpecialNoteColor,
    createdAt: new Date().toISOString(),
  },
  {
    id: "note-3",
    content: "Team meeting on Wednesday at 10 AM to discuss Q4 marketing strategy.",
    color: "blue" as SpecialNoteColor,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
])));


// --- EXPORTED MUTABLE MOCK DATA ---
export let mockBookingCategoriesData: BookingCategory[] = JSON.parse(JSON.stringify(initialMockBookingCategoriesData));
export let mockPackagesData: PhotographyPackage[] = JSON.parse(JSON.stringify(initialMockPackagesData));
export let mockClientsData: Client[] = JSON.parse(JSON.stringify(initialMockClientsData));
export let mockBookingsData: Booking[] = JSON.parse(JSON.stringify(initialMockBookingsData));
export let mockTasksData: Task[] = JSON.parse(JSON.stringify(initialMockTasksData));
export let mockSpecialNotesData: SpecialNote[] = JSON.parse(JSON.stringify(initialMockSpecialNotesData));

// --- RESET FUNCTION ---
export function resetAllMockData() {
  mockBookingCategoriesData = JSON.parse(JSON.stringify(initialMockBookingCategoriesData));
  mockPackagesData = JSON.parse(JSON.stringify(initialMockPackagesData));
  mockClientsData = JSON.parse(JSON.stringify(initialMockClientsData));
  mockBookingsData = JSON.parse(JSON.stringify(initialMockBookingsData));
  mockTasksData = JSON.parse(JSON.stringify(initialMockTasksData));
  mockSpecialNotesData = JSON.parse(JSON.stringify(initialMockSpecialNotesData));
  console.log("All mock data has been reset to initial state.");
}
