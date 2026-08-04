//hello!!!!!!!!!
//hiiiiiiiiii
// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  errors?: any[];
}

// Auth types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  authType?: string;
  phoneNumber?: string;
  createdAt: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Family types
export interface FamilyDocument {
  title: string;
  url: string;
  uploadedAt?: string;
}

export interface Family {
  _id: string;
  id?: string;
  familyCode: string;
  familyName: string;
  headBeneficiaryId?: string;
  familyHead?: string;
  primaryPhone?: string;
  address?: string;
  exactLocation?: string;
  region?: string;
  subRegion?: string;
  description?: string;
  urgencyLevel?: string;
  monthlyIncome?: number;
  monthlyRentAmount?: number;
  familySize?: number;
  childrenCount: number;
  orphanChildrenCount: number;
  documentationUrls?: string;
  isActive: boolean;
  isVerified: boolean;
  registrationStatus?: "incomplete" | "pending" | "verified" | "rejected";
  // Classification(s) when verified: orphan, disabled_disease, old_age, single_mother
  familyClassification?: ("orphan" | "disabled_disease" | "old_age" | "single_mother")[];
  verifiedBy?: string;
  verifiedAt?: string;
  registeredBy?: string;
  lastSupportedAt?: string;
  notes?: string;
  createdAt: string;
  headBeneficiary?: {
    id: string;
    fullName: string;
    gender?: string;
    dateOfBirth?: string;
    age?: number;
  };
  beneficiaries?: Beneficiary[];
  members?: any[];
  documents?: FamilyDocument[];
}

// Beneficiary types
export interface Beneficiary {
  id: string;
  familyId?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number;
  beneficiaryType: string; // 'adult' or 'child'
  isOrphan: boolean;
  orphanType?: string; // 'none', 'father', 'mother', 'both'
  occupation?: string; // For adults
  monthlyIncome?: number; // For adults with occupation
  educationStatus?: string; // For all ages
  healthStatus?: string; // For all ages
  photoUrl?: string; // Photo attachment
  isFamilyHead: boolean;
  relationshipToHead?: string;
  category?: string;
  verificationStatus: string;
  memberClassification?: "orphan" | "disabled_disease" | "old_age" | "single_mother";
  notes?: string;
  createdAt: string;
  family?: {
    id: string;
    familyCode: string;
    familyName: string;
  };
}

// Donor types
export interface Donor {
  id: string;
  donorCode: string;
  name: string;
  donorType: string;
  establishmentDate?: string | null;
  primaryAid?:
    | "emergency_relief"
    | "child_welfare"
    | "medical_aid"
    | "food_distribution"
    | "education_fund"
    | "wash_programs"
    | "other"
    | null;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  country?: string;
  city?: string;
  isAnonymous: boolean;
  isActive: boolean;
  totalDonated: number;
  lastDonationAt?: string;
  registeredAt: string;
  notes?: string;
  createdAt: string;
  donations?: any[];
  recurringDonations?: any[];
  _count?: {
    donations: number;
    recurringDonations: number;
  };
}

// Event types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventType: 'distribution' | 'fundraising' | 'awareness' | 'food_package' | 'medical_aid' | 'job_opportunity' | 'other';
  startDate?: string;
  endDate?: string;
  eventDate?: string;
  location?: string;
  imageUrls?: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  targetAmount?: number;
  collectedAmount: number;
  organizedBy?: string;
  participantCount: number;
  outcomeSummary?: string;
  completedAt?: string;
  parentEventId?: string;
  campaignCode?: string;
  createdAt: string;
  
  // Relations (populated when included)
  parentEvent?: Event;
  childEvents?: Event[];
  donations?: Donation[];
  supportHistory?: SupportHistory[];
  _count?: {
    donations: number;
    supportHistory: number;
  };
}

// Donation types
export interface Donation {
  id: string;
  donorId: string;
  eventId?: string;
  familyId?: string;
  beneficiaryId?: string;

  donationType: string; // monetary | in_kind
  amount?: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  paymentMethod?: string;
  donationReference?: string;
  receivedAt?: string;

  // Receipt upload (staff)
  receiptUrl?: string;
  // Source of the receipt: "chapa" (auto-generated for online donations) | "manual" (staff upload)
  receiptType?: "chapa" | "manual" | string;
  // Origin of the donation: "chapa" (online) | "manual" (staff entry)
  source?: "chapa" | "manual" | string;
  // Chapa transaction reference (tx-...), used to render the internal receipt
  tx_ref?: string;

  // Verification (money only)
  verificationToken?: string;
  verificationProofUrl?: string;
  verificationStatus?: string; // pending | submitted | verified | rejected
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedByUserId?: string;
  verifiedAt?: string;

  description?: string;
  usageNote?: string;

  status: string; // received | pledged
  createdAt: string;
  updatedAt: string;

  donor?: Donor;
  event?: Event;
  family?: Family;
  beneficiary?: Beneficiary;
}

// Internal (self-hosted) receipt for a Chapa donation, built from stored data.
export interface DonationReceipt {
  donationId: string;
  reference: string;
  txRef: string;
  source: string;
  status: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  originalAmount?: number | null;
  originalCurrency?: string | null;
  paymentMethod?: string;
  familyClassification?: string | null;
  eventName?: string | null;
  date: string;
  hostedReceiptUrl?: string | null;
}

// Recurring Donation types
export interface RecurringDonation {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  nextDonationDate?: string;
  isActive: boolean;
  pausedAt?: string;
  pauseReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  donor?: Donor;
}

// Support History types
export interface SupportHistory {
  id: string;
  eventId?: string;
  familyId?: string;
  beneficiaryId?: string;
  targetType: string;
  supportType: string;
  description?: string;
  supportDate: string;
  amountValue?: number;
  currency?: string;
  itemsProvided?: string;
  quantity?: number;
  deliveredBy?: string;
  donorId?: string;
  volunteerId?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  family?: Family;
  beneficiary?: Beneficiary;
  donor?: Donor;
  volunteer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// Dashboard types
export interface DashboardOverview {
  families: {
    total: number;
    verified: number;
    pending: number;
    incomplete: number;
    rejected: number;
    urgent: number;
    classifications?: {
      orphan: number;
      disabled_disease: number;
      old_age: number;
      single_mother: number;
    };
  };
  beneficiaries: {
    total: number;
    orphaned: number;
  };
  donors: {
    total: number;
    active: number;
  };
  events: {
    total: number;
    active: number;
  };
  donations: {
    totalAmount: number;
    totalCount: number;
    monthlyAmount: number;
    recurringCount: number;
  };
}

export interface DonationTrend {
  month: string;
  total: number;
  count: number;
  average: number;
}

export interface TopDonor {
  id: string;
  name: string;
  totalAmount: number;
  donationCount: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

// Filter types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FamilyFilters extends PaginationParams {
  region?: string;
  urgencyLevel?: string;
  isVerified?: boolean;
  search?: string;
    registrationStatus?: "verified" | "pending" | "rejected" | "incomplete";
  registrationCompleted?: boolean;
}

export interface BeneficiaryFilters extends PaginationParams {
  familyId?: string;
  isOrphan?: boolean;
  verificationStatus?: string;
  search?: string;
}

export interface DonorFilters extends PaginationParams {
  search?: string;
  donorType?: string;
}

export interface EventFilters extends PaginationParams {
  status?: string;
  eventType?: string;
  search?: string;
}

export interface Notification {
  _id: string;
  type: "promised" | "donation" | "announcement" | "approved" | "release" | "received";
  title: string;
  body: string;
  read: boolean;
  donationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DonationFilters extends PaginationParams {
  donorId?: string;
  eventId?: string;
  familyId?: string;
  status?: string;
  donationType?: string;
  startDate?: string;
  endDate?: string;
}

// Hero stats — drives the "AMANA / OS" panel + ticker on the landing hero.
// All non-ETB donations are converted to ETB on the backend, so the frontend
// only ever handles a single currency for totals.
export interface HeroStatsCounters {
  familiesSupported: number;
  eventsThisYear: number;
  raisedEtb: number;
}

export interface HeroStatsProgress {
  raised: number;
  goal: number;
  percent: number;
}

export interface HeroTickerDonation {
  donorName: string;
  amount: number;
  currency: string;
  etbEquivalent: number;
  receivedAt: string;
}

export interface HeroTickerSupport {
  supportType: string;
  familyCode: string | null;
  supportDate: string;
}

export interface HeroTickerAggregates {
  raisedThisMonth: number;
  urgentFamilies: number;
  totalDonors?: number;
}

export interface HeroStats {
  counters: HeroStatsCounters;
  progress: HeroStatsProgress;
  ticker: {
    donations: HeroTickerDonation[];
    support: HeroTickerSupport[];
    aggregates: HeroTickerAggregates;
  };
}
