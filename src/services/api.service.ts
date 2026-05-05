// import api from '@/lib/api';
// import type {
//   PaginatedResponse,
//   AuthResponse,
//   LoginCredentials,
//   RegisterData,
//   User,
//   Family,
//   FamilyFilters,
//   Beneficiary,
//   BeneficiaryFilters,
//   Donor,
//   DonorFilters,
//   Event,
//   EventFilters,
//   Donation,
//   DonationFilters,
//   RecurringDonation,
//   SupportHistory,
//   DashboardOverview,
//   DonationTrend,
//   TopDonor,
//   RecentActivity,
// } from '@/types/api';

// // Auth API
// export const authApi = {
//   login: (credentials: LoginCredentials) =>
//     api.post<AuthResponse>('/auth/login', credentials),
  
//   register: (data: RegisterData) =>
//     api.post<AuthResponse>('/auth/signup', data),
  
//   logout: () =>
//     api.post('/auth/logout'),
  
//   getCurrentUser: () =>
//     api.get<User>('/auth/me'),
  
//   refreshToken: () =>
//     api.post<{ token: string }>('/auth/refresh'),
//   // exchangeGoogleCode: (code: string) =>
//   //   api.post<AuthResponse>("/auth/google/exchange", { code }),
//   exchangeGoogleCode: (code: string) =>
//     api.post('/google/callback/exchange', { code }),
// };

// // Family API
// export const familyApi = {
//   getAll: (params?: FamilyFilters) =>
//     api.get<PaginatedResponse<Family>>('/families', { params }),
  
//   getById: (id: string) =>
//     api.get<Family>(`/families/${id}`),
  
//   create: (data: Partial<Family>) =>
//     api.post<Family>('/families', data),
  
//   update: (id: string, data: Partial<Family>) =>
//     api.put<Family>(`/families/${id}`, data),
  
//   delete: (id: string) =>
//     api.delete(`/families/${id}`),
// };

// // Beneficiary API
// export const beneficiaryApi = {
//   getAll: (params?: BeneficiaryFilters) =>
//     api.get<PaginatedResponse<Beneficiary>>('/beneficiaries', { params }),
  
//   getById: (id: string) =>
//     api.get<Beneficiary>(`/beneficiaries/${id}`),
  
//   create: (data: Partial<Beneficiary>) =>
//     api.post<Beneficiary>('/beneficiaries', data),
  
//   update: (id: string, data: Partial<Beneficiary>) =>
//     api.put<Beneficiary>(`/beneficiaries/${id}`, data),
  
//   delete: (id: string) =>
//     api.delete(`/beneficiaries/${id}`),
// };

// // Donor API
// export const donorApi = {
//   getAll: (params?: DonorFilters) =>
//     api.get<PaginatedResponse<Donor>>('/donors', { params }),
  
//   getById: (id: string) =>
//     api.get<Donor>(`/donors/${id}`),
  
//   create: (data: Partial<Donor>) =>
//     api.post<Donor>('/donors', data),
  
//   update: (id: string, data: Partial<Donor>) =>
//     api.put<Donor>(`/donors/${id}`, data),
  
//   delete: (id: string) =>
//     api.delete(`/donors/${id}`),
// };

// // Event API
// export const eventApi = {
//   getAll: (params?: EventFilters) =>
//     api.get<PaginatedResponse<Event>>('/events', { params }),
  
//   getById: (id: string) =>
//     api.get<Event>(`/events/${id}`),
  
//   getStats: (id: string) =>
//     api.get<{
//       totalDonations: number;
//       uniqueDonors: number;
//       familiesSupported: number;
//       totalAmount: number;
//       averageDonation: number;
//       completionPercentage: number;
//     }>(`/events/${id}/stats`),
  
//   create: (data: Partial<Event>) =>
//     api.post<Event>('/events', data),
  
//   update: (id: string, data: Partial<Event>) =>
//     api.put<Event>(`/events/${id}`, data),
  
//   delete: (id: string) =>
//     api.delete(`/events/${id}`),
// };

// // Donation API
// export const donationApi = {
//   getAll: (params?: DonationFilters) =>
//     api.get<PaginatedResponse<Donation>>('/donations', { params }),
  
//   getById: (id: string) =>
//     api.get<Donation>(`/donations/${id}`),
  
//   create: (data: Partial<Donation>) =>
//     api.post<Donation>('/donations', data),
  
//   update: (id: string, data: Partial<Donation>) =>
//     api.put<Donation>(`/donations/${id}`, data),

//   uploadReceipt: (id: string, file: File) => {
//     const formData = new FormData();
//     formData.append('receipt', file);
//     return api.post(`/donations/${id}/receipt`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },
  
//   delete: (id: string) =>
//     api.delete(`/donations/${id}`),
// };

// // Recurring Donation API
// export const recurringDonationApi = {
//   getAll: (params?: { donorId?: string; isActive?: boolean; page?: number; limit?: number }) =>
//     api.get<PaginatedResponse<RecurringDonation>>('/recurring-donations', { params }),
  
//   getById: (id: string) =>
//     api.get<RecurringDonation>(`/recurring-donations/${id}`),
  
//   create: (data: Partial<RecurringDonation>) =>
//     api.post<RecurringDonation>('/recurring-donations', data),
  
//   update: (id: string, data: Partial<RecurringDonation>) =>
//     api.put<RecurringDonation>(`/recurring-donations/${id}`, data),
  
//   pause: (id: string, reason?: string) =>
//     api.patch(`/recurring-donations/${id}/pause`, { reason }),
  
//   resume: (id: string) =>
//     api.patch(`/recurring-donations/${id}/resume`),
  
//   delete: (id: string) =>
//     api.delete(`/recurring-donations/${id}`),
// };

// // Support History API
// export const supportHistoryApi = {
//   getAll: (params?: {
//     eventId?: string;
//     familyId?: string;
//     beneficiaryId?: string;
//     targetType?: string;
//     startDate?: string;
//     endDate?: string;
//     page?: number;
//     limit?: number;
//   }) =>
//     api.get<PaginatedResponse<SupportHistory>>('/support-history', { params }),
  
//   getById: (id: string) =>
//     api.get<SupportHistory>(`/support-history/${id}`),
  
//   create: (data: Partial<SupportHistory>) =>
//     api.post<SupportHistory>('/support-history', data),
  
//   createBulk: (data: {
//     eventId?: string;
//     familyIds?: string[];
//     beneficiaryIds?: string[];
//     supportType: string;
//     supportDate: string;
//     totalAmount?: number;
//     distributeEqually?: boolean;
//     itemsProvided?: Array<{name: string; quantity: string; unit: string}>;
//     deliveredBy?: string;
//     donorId?: string;
//     volunteerId?: string;
//     description?: string;
//     notes?: string;
//     currency?: string;
//   }) =>
//     api.post<{
//       message: string;
//       count: number;
//       data: SupportHistory[];
//     }>('/support-history/bulk', data),
  
//   update: (id: string, data: Partial<SupportHistory>) =>
//     api.put<SupportHistory>(`/support-history/${id}`, data),
  
//   delete: (id: string) =>
//     api.delete(`/support-history/${id}`),
// };

// // Dashboard API
// export const dashboardApi = {
//   getOverview: () =>
//     api.get<DashboardOverview>('/dashboard/overview'),
  
//   getDonationTrends: (params?: { months?: number }) =>
//     api.get<DonationTrend[]>('/dashboard/donation-trends', { params }),
  
//   getTopDonors: (params?: { limit?: number }) =>
//     api.get<TopDonor[]>('/dashboard/top-donors', { params }),
  
//   getRecentActivities: (params?: { limit?: number }) =>
//     api.get<RecentActivity[]>('/dashboard/recent-activities', { params }),
// };

// // Donation Verification API
// export const donationVerificationApi = {
//   generateVerificationLink: (donationId: string) => 
//     api.post(`/donation-verification/${donationId}/generate-verification-link`),
  
//   getDonationByToken: (token: string) => 
//     api.get(`/donation-verification/verify/${token}`),
  
//   uploadProof: (token: string, file: File) => {
//     const formData = new FormData();
//     formData.append('proof', file);
//     return api.post(`/donation-verification/verify/${token}/upload`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
  
//   verifyDonation: (donationId: string, data: { verificationNotes?: string; status?: string }) => 
//     api.post(`/donation-verification/${donationId}/verify`, data),
  
//   rejectVerification: (donationId: string, data: { verificationNotes: string }) => 
//     api.post(`/donation-verification/${donationId}/reject-verification`, data),
  
//   getPendingVerifications: (params?: { page?: number; limit?: number }) => 
//     api.get('/donation-verification/pending-verifications', { params }),
// };

// // Reports API
// export const reportsApi = {
//   getFinancialReport: (params?: { startDate?: string; endDate?: string }) =>
//     api.get('/reports/financial', { params }),
  
//   getBeneficiaryReport: (params?: { startDate?: string; endDate?: string }) =>
//     api.get('/reports/beneficiary', { params }),
  
//   getEventReport: (params?: { startDate?: string; endDate?: string }) =>
//     api.get('/reports/events', { params }),
  
//   getDonorReport: (params?: { startDate?: string; endDate?: string }) =>
//     api.get('/reports/donors', { params }),
  
//   getDashboardStats: () =>
//     api.get('/reports/dashboard'),
// };


import api from '@/lib/api';
import type {
  PaginatedResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Family,
  FamilyFilters,
  Beneficiary,
  BeneficiaryFilters,
  Donor,
  DonorFilters,
  Event,
  EventFilters,
  Donation,
  DonationFilters,
  RecurringDonation,
  SupportHistory,
  DashboardOverview,
  DonationTrend,
  TopDonor,
  RecentActivity,
} from '@/types/api';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/signup', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get<User>('/auth/me'),
  
  // REMOVED: refreshToken — server handles token refresh via cookie rotation
  
  // Google OAuth: full-page redirect (server sets HttpOnly cookie on callback)
  loginWithGoogle: () => {
    const apiOrigin = "https://amana-bckend-api.vercel.app" || import.meta.env.VITE_API_URL;
    window.location.href = `${apiOrigin}/api/auth/google`;
  },
  
  // Only used if your backend supports popup/code-exchange flow
  exchangeGoogleCode: (code: string) =>
    api.post<AuthResponse>('/google/callback/exchange', { code }),
};

// Family API
export const familyApi = {
  getAll: (params?: FamilyFilters) =>
    api.get<PaginatedResponse<Family>>('/families', { params }),
  
  getById: (id: string) =>
    api.get<Family>(`/families/${id}`),
  
  create: (data: Partial<Family>) =>
    api.post<Family>('/families', data),
  
  update: (id: string, data: Partial<Family>) =>
    api.put<Family>(`/families/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/families/${id}`),
};

// Beneficiary API
export const beneficiaryApi = {
  getAll: (params?: BeneficiaryFilters) =>
    api.get<PaginatedResponse<Beneficiary>>('/beneficiaries', { params }),
  
  getById: (id: string) =>
    api.get<Beneficiary>(`/beneficiaries/${id}`),
  
  create: (data: Partial<Beneficiary>) =>
    api.post<Beneficiary>('/beneficiaries', data),
  
  update: (id: string, data: Partial<Beneficiary>) =>
    api.put<Beneficiary>(`/beneficiaries/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/beneficiaries/${id}`),
};

// Donor API
export const donorApi = {
  getAll: (params?: DonorFilters) =>
    api.get<PaginatedResponse<Donor>>('/donors', { params }),
  
  getById: (id: string) =>
    api.get<Donor>(`/donors/${id}`),
  
  create: (data: Partial<Donor>) =>
    api.post<Donor>('/donors', data),
  
  update: (id: string, data: Partial<Donor>) =>
    api.put<Donor>(`/donors/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/donors/${id}`),
};

// Event API
export const eventApi = {
  getAll: (params?: EventFilters) =>
    api.get<PaginatedResponse<Event>>('/events', { params }),
  
  getById: (id: string) =>
    api.get<Event>(`/events/${id}`),
  
  getStats: (id: string) =>
    api.get<{
      totalDonations: number;
      uniqueDonors: number;
      familiesSupported: number;
      totalAmount: number;
      averageDonation: number;
      completionPercentage: number;
    }>(`/events/${id}/stats`),
  
  create: (data: Partial<Event>) =>
    api.post<Event>('/events', data),
  
  update: (id: string, data: Partial<Event>) =>
    api.put<Event>(`/events/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/events/${id}`),
};

// Donation API
export const donationApi = {
  getAll: (params?: DonationFilters) =>
    api.get<PaginatedResponse<Donation>>('/donations', { params }),
  
  getById: (id: string) =>
    api.get<Donation>(`/donations/${id}`),
  
  create: (data: Partial<Donation>) =>
    api.post<Donation>('/donations', data),
  
  update: (id: string, data: Partial<Donation>) =>
    api.put<Donation>(`/donations/${id}`, data),

  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post(`/donations/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  delete: (id: string) =>
    api.delete(`/donations/${id}`),
  getMonth: (months: Array) =>
    api.get(`/donations/months`, {
      params: {months},
      paramsSerializer: {
        indexes: null, // important
      },
    })
};

// Recurring Donation API
export const recurringDonationApi = {
  getAll: (params?: { donorId?: string; isActive?: boolean; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<RecurringDonation>>('/recurring-donations', { params }),
  
  getById: (id: string) =>
    api.get<RecurringDonation>(`/recurring-donations/${id}`),
  
  create: (data: Partial<RecurringDonation>) =>
    api.post<RecurringDonation>('/recurring-donations', data),
  
  update: (id: string, data: Partial<RecurringDonation>) =>
    api.put<RecurringDonation>(`/recurring-donations/${id}`, data),
  
  pause: (id: string, reason?: string) =>
    api.patch(`/recurring-donations/${id}/pause`, { reason }),
  
  resume: (id: string) =>
    api.patch(`/recurring-donations/${id}/resume`),
  
  delete: (id: string) =>
    api.delete(`/recurring-donations/${id}`),
};

// Support History API
export const supportHistoryApi = {
  getAll: (params?: {
    eventId?: string;
    familyId?: string;
    beneficiaryId?: string;
    targetType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<SupportHistory>>('/support-history', { params }),
  
  getById: (id: string) =>
    api.get<SupportHistory>(`/support-history/${id}`),
  
  create: (data: Partial<SupportHistory>) =>
    api.post<SupportHistory>('/support-history', data),
  
  createBulk: (data: {
    eventId?: string;
    familyIds?: string[];
    beneficiaryIds?: string[];
    supportType: string;
    supportDate: string;
    totalAmount?: number;
    distributeEqually?: boolean;
    itemsProvided?: Array<{name: string; quantity: string; unit: string}>;
    deliveredBy?: string;
    donorId?: string;
    volunteerId?: string;
    description?: string;
    notes?: string;
    currency?: string;
  }) =>
    api.post<{
      message: string;
      count: number;
      data: SupportHistory[];
    }>('/support-history/bulk', data),
  
  update: (id: string, data: Partial<SupportHistory>) =>
    api.put<SupportHistory>(`/support-history/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/support-history/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () =>
    api.get<DashboardOverview>('/dashboard/overview'),
  
  getDonationTrends: (params?: { months?: number }) =>
    api.get<DonationTrend[]>('/dashboard/donation-trends', { params }),
  
  getTopDonors: (params?: { limit?: number }) =>
    api.get<TopDonor[]>('/dashboard/top-donors', { params }),
  
  getRecentActivities: (params?: { limit?: number }) =>
    api.get<RecentActivity[]>('/dashboard/recent-activities', { params }),
  getAnalytics: (params: { range: DashboardAnalyticsRange }) =>
    api.get<DashboardAnalyticsResponse>("/dashboard/analytics", { params }),
};

// Donation Verification API
export const donationVerificationApi = {
  generateVerificationLink: (donationId: string) => 
    api.post(`/donation-verification/${donationId}/generate-verification-link`),
  
  getDonationByToken: (token: string) => 
    api.get(`/donation-verification/verify/${token}`),
  
  uploadProof: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('proof', file);
    return api.post(`/donation-verification/verify/${token}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  verifyDonation: (donationId: string, data: { verificationNotes?: string; status?: string }) => 
    api.post(`/donation-verification/${donationId}/verify`, data),
  
  rejectVerification: (donationId: string, data: { verificationNotes: string }) => 
    api.post(`/donation-verification/${donationId}/reject-verification`, data),
  
  getPendingVerifications: (params?: { page?: number; limit?: number }) => 
    api.get('/donation-verification/pending-verifications', { params }),
};

// Reports API
export const reportsApi = {
  getFinancialReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/financial', { params }),
  
  getBeneficiaryReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/beneficiary', { params }),
  
  getEventReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/events', { params }),
  
  getDonorReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/donors', { params }),
  
  getDashboardStats: () =>
    api.get('/reports/dashboard'),
};
