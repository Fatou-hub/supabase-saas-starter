import { createClient } from '@supabase/supabase-js';

// IMPORTANT : Remplacez ces valeurs par vos vraies clés Supabase
// Vous les trouveez dans : Supabase Dashboard > Settings > API

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.error('Créez un fichier .env à la racine avec :');
  console.error('VITE_SUPABASE_URL=votre_url');
  console.error('VITE_SUPABASE_ANON_KEY=votre_cle');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

('🔗 Initialisation Supabase...');
('🔗 URL:', supabaseUrl);
('🔑 Anon Key (20 premiers caractères):', supabaseAnonKey?.substring(0, 20) + '...');

(async () => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Test connexion Supabase ÉCHEC:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
    } else {
      ('✅ Test connexion Supabase RÉUSSI');
      ('✅ Nombre de profils dans la BDD:', count);
    }
  } catch (err) {
    console.error('❌ Exception test connexion:', err);
  }
})();

// Webhooks n8n (optionnels)
export const WEBHOOKS = {
  SUBMISSION: import.meta.env.VITE_N8N_WEBHOOK_SUBMISSION || '',
  VALIDATION: import.meta.env.VITE_N8N_WEBHOOK_VALIDATION || '',
  CONSULTATION: import.meta.env.VITE_N8N_WEBHOOK_CONSULTATION || '',
};

// Type helper pour les tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'organisation' | ' member' | 'client';
          agency_id: string | null;
          agency_name: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      records: {
        Row: {
          id: string;
          submitted_by: string;
          agency_id: string;
         recipient_email: string | null;
          employee_first_name: string;
          employee_last_name: string;
          employee_pluri_rh: string | null;
          company_name: string;
           client_email: string;
          company_contract_number: string | null;
          company_location: string | null;
          week_start: string;
          week_number: number | null;
          year: number | null;
          hours: any; // JSONB
          comments: string | null;
          mission_status: string | null;
          total_hours: number;
          status: 'pending' | 'approved' | 'rejected';
          validator_name: string | null;
          validator_email: string | null;
          validation_comment: string | null;
          validated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['records']['Insert']>;
      };
    };
  };
};