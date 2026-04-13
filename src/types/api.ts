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
  createdAt: string;
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
export interface Family {
  id: string;
  familyCode: string;
  familyName: string;
  headBeneficiaryId?: string;
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
  registrationStatus?: "incomplete" | "pending" | "verified";
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
  id: string;
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
  paymentMethod?: string;
  donationReference?: string;
  receivedAt?: string;

  // Receipt upload (staff)
  receiptUrl?: string;

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
    urgent: number;
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

export interface DonationFilters extends PaginationParams {
  donorId?: string;
  eventId?: string;
  familyId?: string;
  status?: string;
  donationType?: string;
  startDate?: string;
  endDate?: string;
}
