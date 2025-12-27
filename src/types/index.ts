// Types pour les rôles utilisateur
export type UserRole = 'organisation' | ' member' | 'client';

// Profile utilisateur Supabase
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  agency_id: string | null;
  created_at?: string;
  updated_at?: string;
}

// Informations utilisateur enrichies
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  agencyName?: string;
}

// Données d'un user
export interface User {
  firstName: string;
  lastName: string;
  pluriRH: string;
}

// Données d'une client
export interface Company {
  name: string;
  email: string;
  contractNumber: string;
  location: string;
}

// Heures d'une journée
export interface DayHours {
  date: string;
  dayStart: string;
  dayEnd: string;
  nightStart: string;
  nightEnd: string;
  pause: number;
}

// Heures de la semaine
export interface WeekHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// Statut de mission
export type MissionStatus = 'Terminée' | 'En cours' | 'Suspendue';

// Données du formulaire de item
export interface TimesheetFormData {
  user: User;
  client: Company;
  weekStart: string;
  hours: WeekHours;
  comments: string;
  missionStatus: MissionStatus;
}

// Statut du item
export type RecordStatus = 'waiting' | 'validated' | 'rejected' | 'ongoing';

// Item complet
export interfaceRecord {
  id?: string;
  user: User;
  client: Company;
  weekStart: string;
  status: RecordStatus;
  submittedAt: string;
  submittedBy: string;
  organizationId: string;
  totalHours?: string;
  hours?: WeekHours;
  comments?: string;
  missionStatus?: MissionStatus;
}

// Payload pour le webhook de soumission
export interface SubmissionWebhookPayload {
  timesheetId: string;
  organizationId: string;
  agencyName?: string;
  submittedBy: string;
  submittedAt: string;
  releve_data: {
    user: User;
    client: Company;
    weekStart: string;
    hours: WeekHours;
    comments: string;
    missionStatus: MissionStatus;
    totalHours: string;
  };
 recipient_email: string;
}

// Payload pour le webhook de validation
export interface ValidationWebhookPayload {
  token: string;
  status: 'validé' | 'rejeté';
  comments?: string;
  validatedBy?: string;
  validatedAt: string;
}

// Réponse du webhook de lecture
export interface ReadWebhookResponse {
  success: boolean;
  record:Record;
}
