// Mock user data
export const mockUsers = [
  {
    id: 'CR001',
    name: 'John Doe',
    role: 'care-recipient',
  },
  {
    id: 'CR002',
    name: 'Mary Smith',
    role: 'care-recipient',
  },
  {
    id: 'CG001',
    name: 'Alice Johnson',
    role: 'caregiver',
    assignedRecipients: ['CR001', 'CR002', 'CR003'],
  },
  {
    id: 'CG002',
    name: 'Bob Williams',
    role: 'caregiver',
    assignedRecipients: ['CR001', 'CR002'],
  },
  {
    id: 'CR003',
    name: 'Emma Brown',
    role: 'care-recipient',
  },
];

// Mock care recipients data
export const careRecipients = [
  {
    id: 'CR001',
    name: 'John Doe',
    age: 78,
    room: '101',
  },
  {
    id: 'CR002',
    name: 'Mary Smith',
    age: 82,
    room: '102',
  },
  {
    id: 'CR003',
    name: 'Emma Brown',
    age: 75,
    room: '103',
  },
];

// Mock shifts data
export const shifts = [
  {
    id: 'S001',
    careRecipientId: 'CR001',
    shiftNumber: 1,
    day: 1,
    date: '2026-01-13',
    recordings: ['R001', 'R002', 'R003'],
  },
  {
    id: 'S002',
    careRecipientId: 'CR001',
    shiftNumber: 2,
    day: 2,
    date: '2026-01-14',
    recordings: ['R004', 'R005'],
  },
  {
    id: 'S003',
    careRecipientId: 'CR002',
    shiftNumber: 1,
    day: 1,
    date: '2026-01-13',
    recordings: ['R006'],
  },
  {
    id: 'S004',
    careRecipientId: 'CR003',
    shiftNumber: 1,
    day: 1,
    date: '2026-01-13',
    recordings: ['R007', 'R008'],
  },
];

// Mock recordings data
export const recordings = [
  {
    id: 'R001',
    shiftId: 'S001',
    careRecipientId: 'CR001',
    timestamp: '2026-01-13T08:30:00',
    duration: 45,
    audioUrl: null, // Will be implemented later with actual recording
    notes: [
      {
        id: 'N001',
        caregiverId: 'CG001',
        caregiverName: 'Alice Johnson',
        content: 'Patient mentioned feeling cold. Added extra blanket.',
        timestamp: '2026-01-13T09:00:00',
      },
    ],
  },
  {
    id: 'R002',
    shiftId: 'S001',
    careRecipientId: 'CR001',
    timestamp: '2026-01-13T12:15:00',
    duration: 30,
    audioUrl: null,
    notes: [],
  },
  {
    id: 'R003',
    shiftId: 'S001',
    careRecipientId: 'CR001',
    timestamp: '2026-01-13T15:45:00',
    duration: 60,
    audioUrl: null,
    notes: [
      {
        id: 'N002',
        caregiverId: 'CG002',
        caregiverName: 'Bob Williams',
        content: 'Discussed lunch menu preferences.',
        timestamp: '2026-01-13T16:00:00',
      },
    ],
  },
  {
    id: 'R004',
    shiftId: 'S002',
    careRecipientId: 'CR001',
    timestamp: '2026-01-14T08:30:00',
    duration: 50,
    audioUrl: null,
    notes: [],
  },
  {
    id: 'R005',
    shiftId: 'S002',
    careRecipientId: 'CR001',
    timestamp: '2026-01-14T14:20:00',
    duration: 40,
    audioUrl: null,
    notes: [],
  },
  {
    id: 'R006',
    shiftId: 'S003',
    careRecipientId: 'CR002',
    timestamp: '2026-01-13T09:00:00',
    duration: 35,
    audioUrl: null,
    notes: [],
  },
  {
    id: 'R007',
    shiftId: 'S004',
    careRecipientId: 'CR003',
    timestamp: '2026-01-13T10:00:00',
    duration: 55,
    audioUrl: null,
    notes: [],
  },
  {
    id: 'R008',
    shiftId: 'S004',
    careRecipientId: 'CR003',
    timestamp: '2026-01-13T13:30:00',
    duration: 42,
    audioUrl: null,
    notes: [],
  },
];
