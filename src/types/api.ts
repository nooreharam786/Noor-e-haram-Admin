export type Role = "user" | "admin";
export type ApplicationStatus = "pending" | "selected" | "not_selected";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type DonationStatus = "pending" | "completed" | "failed";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Applicant = {
  id: string;
  registrationNo: string;
  coverId?: string; // Alias/fallback to support existing UI usages
  phone: string;
  stateCode: string;
  stateName: string;
  city: string;
  address: string;
  persons: number;
  entryFee: number;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  travellers: {
    id: string;
    fullName: string;
    phone: string;
  }[];
  paymentId?: string | null;
  orderId?: string | null;
  completedAt?: string | null;
  createdAt: string;
  user: { name: string; email: string };
  draw?: { name: string };
  receipt?: PaymentReceipt | null;
};

export type PrintApplicant = {
  id: string;
  registrationNo: string;
  coverId?: string; // Fallback alias
  phone: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  user: { name: string };
};

export type PaymentReceipt = {
  id: string;
  receiptNo: string;
  applicationId: string;
  amount: number;
  paymentId: string;
  orderId: string;
  generatedAt: string;
};

export type DrawResult = {
  id: string;
  totalUsers: number;
  selectedCount: number;
  percentage: number | null;
  createdAt: string;
};

export type Stats = {
  totalUsers: number;
  totalApplicants: number;
  paidUsers: number;
  selectedUsers: number;
  lastDraw: DrawResult | null;
};

export type Feedback = {
  id: string;
  name: string;
  rating: number;
  message: string;
  location?: string | null;
  source: string;
  approved: boolean;
  createdAt: string;
};

export type PublicDocument = {
  id: string;
  title: string;
  description?: string | null;
  filename: string;
  kind: string;
  url: string;
  createdAt: string;
};

export type Donation = {
  id: string;
  receiptId?: string | null;
  donorName: string;
  phone: string;
  email?: string | null;
  amount: number;
  currency: string;
  donationType: string;
  onBehalfOf?: string | null;
  status: DonationStatus;
  paymentId?: string | null;
  orderId?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
