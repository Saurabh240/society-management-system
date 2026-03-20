export const EMAILS = [
  { id: 1, subject: "Monthly Newsletter - February 2026", recipient: "All Residents", date: "2026-02-25", status: "Sent"      },
  { id: 2, subject: "Pool Maintenance Notice",            recipient: "Oakwood HOA",   date: "2026-02-23", status: "Sent"      },
  { id: 3, subject: "Board Meeting Reminder",             recipient: "Board Members", date: "2026-02-20", status: "Scheduled" },
];

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

export const TEMPLATES = [
  { id: 1, name: "Monthly Newsletter" },
  { id: 2, name: "Violation Notice"   },
  { id: 3, name: "Welcome Letter"     },
];