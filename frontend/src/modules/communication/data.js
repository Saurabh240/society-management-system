// ── Emails ────────────────────────────────────────────────────────────────────
export const EMAILS = [
  { id: 1, subject: "Monthly Newsletter - February 2026", recipient: "All Residents", date: "2026-02-25", status: "Sent"      },
  { id: 2, subject: "Pool Maintenance Notice",            recipient: "Oakwood HOA",   date: "2026-02-23", status: "Sent"      },
  { id: 3, subject: "Board Meeting Reminder",             recipient: "Board Members", date: "2026-02-20", status: "Scheduled" },
];

// ── Mailings ──────────────────────────────────────────────────────────────────
export const MAILINGS = [
  {
    id: 1, title: "Annual Report 2025", recipient: "Sunset Village (2 owners)", date: "1/15/2026 at 09:30 AM", status: "Delivered",
    associationName: "Sunset Village", templateUsed: "Annual Report Template", category: "Report",
    subject: "Annual Report 2025", content: "Please find attached the annual report for 2025...",
    recipients: [
      { id: 1, name: "Emily Martinez", address: "456 Sunset Blvd, Unit 12, Los Angeles, CA, 90028" },
      { id: 2, name: "David Chen",     address: "456 Sunset Blvd, Unit 15, Los Angeles, CA, 90028" },
    ],
  },
  {
    id: 2, title: "Updated CC&Rs", recipient: "Sunset Village (3 owners)", date: "12/1/2025 at 02:15 PM", status: "Delivered",
    associationName: "Sunset Village", templateUsed: "", category: "",
    subject: "Updated CC&Rs", content: "Please review the updated CC&Rs document...",
    recipients: [
      { id: 1, name: "Emily Martinez", address: "456 Sunset Blvd, Unit 12, Los Angeles, CA, 90028" },
      { id: 2, name: "David Chen",     address: "456 Sunset Blvd, Unit 15, Los Angeles, CA, 90028" },
      { id: 3, name: "Sarah Chen",     address: "456 Sunset Blvd, Unit 18, Los Angeles, CA, 90028" },
    ],
  },
];

// ── Templates ─────────────────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: 1, name: "Monthly Newsletter",        level: "Association", recipientType: "Association Owners", category: "Newsletter",  lastModified: "2/20/2026 at 10:45 AM", description: "Standard monthly newsletter template",         emailSubject: "Your Monthly Community Newsletter",    content: "Dear Homeowner,\n\nThis is your monthly community newsletter..." },
  { id: 2, name: "Violation Notice",           level: "Individual",  recipientType: "Association Owners", category: "Compliance",  lastModified: "1/15/2026 at 02:30 PM", description: "Notice for HOA violations",                    emailSubject: "Notice of HOA Violation",               content: "Dear Homeowner,\n\nWe have identified a violation..." },
  { id: 3, name: "Welcome Letter",             level: "Individual",  recipientType: "Association Owners", category: "Onboarding",  lastModified: "12/10/2025 at 09:15 AM", description: "Welcome letter for new residents",            emailSubject: "Welcome to the Community",              content: "Dear Homeowner,\n\nWelcome to our community..." },
  { id: 4, name: "Service Request",            level: "Vendors",     recipientType: "Vendors",            category: "Maintenance", lastModified: "3/1/2026 at 11:20 AM",  description: "Service request for vendors",                 emailSubject: "Service Request",                       content: "Dear Vendor,\n\nWe have a service request..." },
  { id: 5, name: "Vendor Payment Confirmation",level: "Vendors",     recipientType: "Vendors",            category: "Accounting",  lastModified: "2/28/2026 at 04:45 PM", description: "Payment confirmation for vendors",            emailSubject: "Payment Confirmation",                  content: "Dear Vendor,\n\nYour payment has been processed..." },
  { id: 6, name: "Insurance Reminder",         level: "Vendors",     recipientType: "Vendors",            category: "Compliance",  lastModified: "1/20/2026 at 01:30 PM", description: "Insurance renewal reminder for vendors",      emailSubject: "Insurance Renewal Reminder",            content: "Dear Vendor,\n\nThis is a reminder to renew your insurance..." },
];

// ── Text Messages ─────────────────────────────────────────────────────────────
export const TEXT_MESSAGES = [
  { id: 1, message: "Reminder: HOA meeting tomorrow at 7 PM in the community center.", recipient: "Emily Martinez",              phone: "(555) 123-4567",                                       date: "3/27/2026 at 01:00 PM", status: "Delivered"  },
  { id: 2, message: "Reminder: HOA meeting tomorrow at 7 PM in the community center.", recipient: "Emily Martinez",              phone: "(555) 123-4567",                                       date: "3/27/2026 at 01:00 PM", status: "Delivered"  },
  { id: 3, message: "Important: Pool will be closed for maintenance Mar...",           recipient: "Sunset Village (All Owners)", phone: "(555) 123-4567, (555) 234-5678, (555) 345-6789",       date: "2/25/2026 at 11:15 AM", status: "Delivered"  },
  { id: 4, message: "Your monthly HOA statement is ready for review. Pl...",           recipient: "Michael Chen",               phone: "(555) 987-6543",                                       date: "3/15/2026 at 09:00 AM", status: "Scheduled"  },
];

// ── Associations (used in recipient selection + create forms) ─────────────────
export const ASSOCIATIONS = [
  {
    id: 1,
    name: "Sunset Village",
    ownerCount: 3,
    owners: [
      { id: 1, name: "Emily Martinez",   unit: "Unit 201", email: "emily.martinez@example.com"   },
      { id: 2, name: "David Chen",       unit: "Unit 202", email: "david.chen@example.com"       },
      { id: 3, name: "Sarah Chen",       unit: "Unit 202", email: "sarah.chen@example.com"       },
    ],
  },
  {
    id: 2,
    name: "Riverside Community",
    ownerCount: 2,
    owners: [
      { id: 4, name: "Jessica Williams", unit: "Unit 301", email: "jessica.williams@example.com" },
      { id: 5, name: "Robert Taylor",    unit: "Unit 302", email: "robert.taylor@example.com"    },
    ],
  },
  {
    id: 3,
    name: "Green Valley",
    ownerCount: 4,
    owners: [
      { id: 6, name: "Amanda Wilson",    unit: "Unit 401", email: "amanda.wilson@example.com"    },
      { id: 7, name: "Michael Wilson",   unit: "Unit 401", email: "michael.wilson@example.com"   },
      { id: 8, name: "James Anderson",   unit: "Unit 402", email: "james.anderson@example.com"   },
      { id: 9, name: "Lisa Thompson",    unit: "Unit 403", email: "lisa.thompson@example.com"    },
    ],
  },
];

// ── Template names only (used in email/mailing create forms) ──────────────────
export const TEMPLATE_NAMES = [
  { id: 1, name: "Monthly Newsletter" },
  { id: 2, name: "Violation Notice"   },
  { id: 3, name: "Welcome Letter"     },
];

// ── Vendors (used in recipient selection) ────────────────────────────────────
export const VENDORS = [
  { id: 10, name: "Green Thumb Landscaping", contact: "John Smith",   email: "john@greenthumb.com"    },
  { id: 11, name: "ABC Plumbing Services",   contact: "Sarah Johnson", email: "sarah@abcplumbing.com"  },
];