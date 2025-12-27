// User roles
export type UserRole = 'admin' | 'member' | 'viewer';

// User profile
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string | null;
  organization_name?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Authenticated user
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
}

// Record status
export type RecordStatus = 'pending' | 'approved' | 'rejected';

// Generic record
export interface Record {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  description?: string;
  data?: any; // Flexible JSONB data
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

// Record form data
export interface RecordFormData {
  title: string;
  description?: string;
  data?: any;
}