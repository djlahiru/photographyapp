
import type { PhotographyPackage, Client, Booking, BookingStatus, PaymentStatus, BookingActivityLogEntry, BookingDateTime } from '@/types';

// --- PACKAGES DATA ---
export let mockPackagesData: PhotographyPackage[] = [
  { id: "1", name: "Basic Portrait Session", description: "A quick session for individual portraits, perfect for headshots or a small update.", price: 150, services: ["30 min session", "5 edited photos", "Online gallery access"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "portrait photography" },
  { id: "2", name: "Standard Wedding Package", description: "Comprehensive wedding day coverage from getting ready to the first dance.", price: 2500, services: ["8 hours coverage", "2 photographers", "Online gallery", "300+ edited photos", "Engagement session discount"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "wedding event" },
  { id: "3", name: "Family Lifestyle Shoot", description: "Capture natural family moments in a relaxed outdoor or in-home setting.", price: 350, services: ["1 hour session", "Outdoor or in-home", "50 edited photos", "Print release"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "family photoshoot" },
  { id: "4", name: "Event Photography", description: "Coverage for corporate events, parties, or other special occasions.", price: 600, services: ["Up to 3 hours coverage", "Online gallery", "All usable photos delivered"], imageUrl: "https://placehold.co/600x400.png", dataAiHint: "corporate event" },
];

// --- CLIENTS DATA ---
export let mockClientsData: Client[] = [
  { id: "1", name: "Alice Wonderland", contactDetails: { email: "alice@example.com", phone: "555-1234", whatsapp: "555-1234" }, address: "123 Storybook Lane", totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "female person", notes: "Prefers morning shoots. Allergic to cats." },
  { id: "2", name: "Bob The Builder", contactDetails: { email: "bob@example.com", phone: "555-5678" }, address: "456 Construction Rd", totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "male person", notes: "Needs invoices sent to accounting@bobcorp.com." },
  { id: "3", name: "Charlie Chaplin", contactDetails: { email: "charlie@example.com" }, totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "classic actor", notes: "" },
  { id: "4", name: "Diana Prince", contactDetails: { email: "diana@example.com" }, totalPayments: 0, outstandingBalance: 0, totalBookings: 0, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "heroine woman", notes: "" },
];

// --- BOOKINGS DATA ---
export let mockBookingsData: Booking[] = [
  {
    id: "1",
    clientName: "Alice Wonderland",
    packageName: "Basic Portrait Session",
    packageId: "1",
    bookingDates: [{ id: 'dt1_1', dateTime: "2024-08-15T14:00:00Z" }],
    category: "Portrait",
    status: "Confirmed" as BookingStatus,
    price: 150,
    payments: [
      { id: "p1a", bookingId: "1", amount: 75, paymentDate: "2024-08-02T11:30:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Deposit" },
      { id: "p1b", bookingId: "1", amount: 75, paymentDate: "2024-08-14T10:00:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Final Payment" }
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
    id: "2",
    clientName: "Bob The Builder",
    packageName: "Standard Wedding Package",
    packageId: "2",
    bookingDates: [{ id: 'dt2_1', dateTime: "2024-09-20T10:30:00Z" }],
    category: "Wedding",
    status: "Completed" as BookingStatus,
    price: 2500,
    payments: [
      { id: "p2a", bookingId: "2", amount: 1000, paymentDate: "2024-07-10T10:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Initial Deposit" },
      { id: "p2b", bookingId: "2", amount: 1500, paymentDate: "2024-09-15T14:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Final Balance" }
    ],
    activityLog: [
        { id: "log2a", timestamp: "2024-07-01T10:00:00Z", action: "Booking created by Bob The Builder.", actor: "Bob The Builder", iconName: "PlusCircle" },
        { id: "log2b", timestamp: "2024-07-10T10:00:00Z", action: "Payment of $1000 received (Initial Deposit).", actor: "System", iconName: "DollarSign" },
        { id: "log2c", timestamp: "2024-09-15T14:00:00Z", action: "Final payment of $1500 received.", actor: "System", iconName: "DollarSign" },
        { id: "log2d", timestamp: "2024-09-21T10:00:00Z", action: "Booking status changed to Completed.", actor: "Admin", iconName: "CheckCircle" },
    ]
  },
  {
    id: "3",
    clientName: "Charlie Chaplin",
    packageName: "Family Lifestyle Shoot",
    packageId: "3",
    bookingDates: [{ id: 'dt3_1', dateTime: "2024-07-30T16:00:00Z" }],
    category: "Family",
    status: "Pending" as BookingStatus,
    price: 350,
    payments: [
      { id: "p3a", bookingId: "3", amount: 100, paymentDate: "2024-07-20T12:00:00Z", method: "PayPal", status: "Pending" as PaymentStatus, description: "Deposit" }
    ],
    activityLog: [
        { id: "log3a", timestamp: "2024-07-19T10:00:00Z", action: "Booking created.", actor: "Charlie Chaplin", iconName: "PlusCircle" },
        { id: "log3b", timestamp: "2024-07-20T12:00:00Z", action: "Deposit payment of $100 initiated.", actor: "System", iconName: "DollarSign" },
    ]
  },
  {
    id: "4",
    clientName: "Diana Prince",
    packageName: "Basic Portrait Session",
    packageId: "1",
    bookingDates: [{ id: 'dt4_1', dateTime: "2024-08-05T09:00:00Z" }],
    category: "Portrait",
    status: "Cancelled" as BookingStatus,
    price: 150,
    activityLog: [
       { id: "log4a", timestamp: "2024-07-20T10:00:00Z", action: "Booking requested.", actor: "Diana Prince", iconName: "FilePlus" },
       { id: "log4b", timestamp: "2024-07-28T16:00:00Z", action: "Booking cancelled by client.", actor: "Diana Prince", iconName: "XCircle" },
    ]
  },
];
