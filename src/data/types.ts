export type Lang = "en" | "es";

export type CareType =
  | "daycare"
  | "nanny"
  | "babysitter"
  | "afterschool"
  | "infant"
  | "special"
  | "backup"
  | "camp"
  | "overnight"
  | "dropin"
  | "tutoring"
  | "housekeeping";

export type Grade = "Infant" | "Toddler" | "Preschool" | "Pre-K" | "Elementary";

export type Parent = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  dob: string;
  relationship: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  employer: string;
  workPhone: string;
  hearAbout: string;
  marketing: boolean;
};

export type Medication = { name: string; dose: string; schedule: string };

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  dob: string;
  gender: "Boy" | "Girl" | "Prefer not to say";
  grade: Grade;
  allergies: string[];
  medical: string;
  medications: Medication[];
  specialNeeds: string;
  diet: string;
  pediatrician: string;
  pediatricianPhone: string;
  insurance: string;
  memberId: string;
  notes: string;
  avatar: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone: string;
  canDecide: boolean;
};

export type PickupPerson = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  pin: string;
  childIds: string[];
  photo: string;
  idUploaded: boolean;
};

export type CarePrefs = {
  types: CareType[];
  schedule: "Full-time" | "Part-time" | "Occasional";
  days: string[];
  startDate: string;
  budget: number;
  musts: string[];
  radius: number;
};

export type PayCard = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  zip: string;
  fsa: boolean;
  isDefault: boolean;
};

export type Consents = {
  photos: boolean;
  medical: boolean;
  signed: boolean;
  signature: string;
};

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Submitted"
  | "Under Review"
  | "Offered"
  | "Enrolled";

export type Booking = {
  id: string;
  providerId: string;
  childIds: string[];
  type: "once" | "recurring" | "lastminute" | "enrollment";
  date: string;
  endDate: string;
  start: string;
  end: string;
  days: string[];
  status: BookingStatus;
  addons: string[];
  notes: string;
  pickupId: string;
  total: number;
  promo: string;
};

export type InvoiceStatus = "Due" | "Paid" | "Overdue";

export type Invoice = {
  id: string;
  number: string;
  providerId: string;
  childId: string;
  status: InvoiceStatus;
  due: string;
  paidAt: string;
  lines: { label: string; amount: number }[];
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  image?: string;
};

export type Thread = {
  id: string;
  providerId: string;
  title: string;
  unread: number;
  archived: boolean;
  typing: boolean;
  messages: ChatMessage[];
};

export type UpdateKind =
  | "checkin"
  | "checkout"
  | "meal"
  | "nap"
  | "diaper"
  | "mood"
  | "activity"
  | "medication"
  | "photo"
  | "milestone"
  | "incident";

export type DailyUpdate = {
  id: string;
  childId: string;
  kind: UpdateKind;
  date: string;
  time: string;
  title: string;
  body: string;
  photo?: string;
};

export type NoteKind = "bookings" | "updates" | "payments";

export type AppNote = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type DocFolder = "Enrollment" | "Medical" | "Immunization" | "Consent" | "Receipts";

export type VaultDoc = {
  id: string;
  folder: DocFolder;
  name: string;
  date: string;
  expires: string;
  pendingSign: boolean;
};

export type Review = {
  id: string;
  providerId: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  tags: string[];
  reply?: string;
};

export type Incident = {
  id: string;
  childId: string;
  providerId: string;
  when: string;
  where: string;
  what: string;
  action: string;
  staff: string;
  photo: string;
  acknowledged: boolean;
};

export type Provider = {
  id: string;
  name: string;
  type: CareType;
  rating: number;
  reviewCount: number;
  priceLabel: string;
  hourly: number;
  monthly: number;
  weeklyCost: number;
  distance: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  badges: string[];
  availability: string;
  days: string[];
  openNow: boolean;
  about: string;
  philosophy: string;
  years: number;
  roles: string;
  education: string[];
  license: { number: string; status: string; expires: string } | null;
  background: { status: string; date: string; vendor: string };
  rates: { label: string; amount: string }[];
  hours: string;
  capacity: string;
  ages: string;
  ageGroups: Grade[];
  languages: string[];
  meals: string;
  nutFree: boolean;
  curriculum: string[];
  safety: string[];
  policies: { label: string; text: string }[];
  photo: string;
  avatar: string;
  gallery: string[];
};

export type Family = {
  user: Parent;
  children: Child[];
  contacts: EmergencyContact[];
  pickups: PickupPerson[];
  prefs: CarePrefs;
  cards: PayCard[];
  consents: Consents;
  favorites: string[];
  bookings: Booking[];
  invoices: Invoice[];
  threads: Thread[];
  updates: DailyUpdate[];
  notifications: AppNote[];
  documents: VaultDoc[];
  reviews: Review[];
  incidents: Incident[];
  faceId: boolean;
  autopay: boolean;
  setupComplete: boolean;
  notifPrefs: Record<string, boolean>;
  selectedChild: string;
};

export type BookingDraft = {
  providerId: string;
  type: Booking["type"];
  childIds: string[];
  date: string;
  endDate: string;
  noEnd: boolean;
  start: string;
  end: string;
  days: string[];
  frequency: "Weekly" | "Bi-weekly";
  sessions: number;
  addons: string[];
  notes: string;
  pickupId: string;
  promo: string;
};
