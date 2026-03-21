// ── Emails ────────────────────────────────────────────────────────────────────
export const EMAILS = [
  { id: 1, subject: "Monthly Newsletter - February 2026", recipient: "All Residents", date: "2026-02-25", status: "Sent"      },
  { id: 2, subject: "Pool Maintenance Notice",            recipient: "Oakwood HOA",   date: "2026-02-23", status: "Sent"      },
  { id: 3, subject: "Board Meeting Reminder",             recipient: "Board Members", date: "2026-02-20", status: "Scheduled" },
];

// ── Mailings ──────────────────────────────────────────────────────────────────
export const MAILINGS = [
  { id: 1, title: "Violation Notice",   recipient: "Sunset Village (1 owners)", date: "2026-03-21", status: "Delivered", associationName: "Sunset Village" },
  { id: 2, title: "Annual Report 2025", recipient: "Sunset Village (2 owners)", date: "2026-01-15", status: "Delivered", associationName: "Sunset Village" },
  { id: 3, title: "Updated CC&Rs",      recipient: "Sunset Village (3 owners)", date: "2025-12-01", status: "Delivered", associationName: "Sunset Village" },
];

// ── Templates ─────────────────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: 1, name: "Monthly Newsletter", level: "Association", category: "Newsletter", lastModified: "2026-02-20" },
  { id: 2, name: "Violation Notice",   level: "Individual",  category: "Compliance", lastModified: "2026-01-15" },
  { id: 3, name: "Welcome Letter",     level: "Individual",  category: "Onboarding", lastModified: "2025-12-10" },
];

// ── Text Messages ─────────────────────────────────────────────────────────────
export const TEXT_MESSAGES = [
  { id: 1, message: "Reminder: HOA meeting tomorrow at 7 PM in the comm...", recipient: "Emily Martinez",              phone: "(555) 123-4567",                                 date: "2026-02-28", status: "Delivered" },
  { id: 2, message: "Important: Pool will be closed for maintenance Mar...", recipient: "Sunset Village (All Owners)", phone: "(555) 123-4567, (555) 234-5678, (555) 345-6789", date: "2026-02-25", status: "Delivered" },
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