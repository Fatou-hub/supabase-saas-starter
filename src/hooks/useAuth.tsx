import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Types
export interface User {
  id: string;
  email: string;
  role: 'organisation' | ' member' | 'client';
  organizationId?: string;
  agencyName?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'organisation' | ' member' | 'client') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
  try {
    ('👤 === DÉBUT loadUserProfile ===');
    ('👤 Email:', supabaseUser.email);
    ('👤 ID:', supabaseUser.id);
    
    ('📡 Appel Supabase profiles avec timeout 3s...');
    
    // Créer une promesse de timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        console.warn('⏰ TIMEOUT atteint (3s)');
        reject(new Error('Timeout'));
      }, 3000);
      return id;
    });
    
    // Créer la promesse de requête Supabase  
    const fetchPromise = (async () => {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      ('📊 Requête terminée:', result);
      return result;
    })();
    
    // Course entre les deux
    const { data: profile, error } = await Promise.race([
      fetchPromise, 
      timeoutPromise
    ]) as any;

    ('📊 Résultat final:', { profile, error });

    if (error) {
      console.error('❌ Erreur chargement profil:', error);
      throw error;
    }

    if (!profile) {
      console.error('❌ Profil est null !');
      throw new Error('Profil null');
    }

    ('✅ Profil récupéré:', profile);

    // Update last_login (non bloquant) - VERSION CORRIGÉE
    (async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', supabaseUser.id);
        ('✅ last_login_at mis à jour');
      } catch (e) {
        console.warn('⚠️ Erreur update last_login:', e);
      }
    })();

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: profile.role,
      organizationId: profile.agency_id,
      agencyName: profile.agency_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
    });
    
    ('✅ User state mis à jour, rôle:', profile.role);
    ('👤 === FIN loadUserProfile SUCCÈS ===');
    
  } catch (err: any) {
    console.error('❌ === EXCEPTION loadUserProfile ===');
    console.error('❌ Message:', err?.message || err);
    
    // FALLBACK : Profil temporaire pour débloquer la connexion
    console.warn('⚠️ FALLBACK - Création profil temporaire');
    
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: 'organisation',
      organizationId: undefined,
      agencyName: 'Organisation (temporaire)',
      firstName: undefined,
      lastName: undefined,
    });
    
    ('✅ Profil temporaire créé - VOUS POUVEZ VOUS CONNECTER');
    ('⚠️ Rechargez la page dans quelques secondes pour retry');
  }
};

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
     try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // NOUVEAU : Si erreur ou pas de session, nettoyer
    if (error || !session) {
      ('🧹 Nettoyage de la session invalide');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    }
    
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  } catch (err) {
    console.error('Erreur vérification session:', err);
    // Nettoyer en cas d'erreur
    localStorage.clear();
    sessionStorage.clear();
  } finally {
    setLoading(false);
  }
};

    checkSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
     async (event, session) => {
    try {
      ('🔄 Auth state change:', event);
      ('📦 Session:', session ? 'Présente' : 'Absente');
      
      if (event === 'SIGNED_OUT') {
        ('🧹 Nettoyage après déconnexion');
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
      } 
      else if (event === 'SIGNED_IN' && session?.user) {
        ('🔐 SIGNED_IN détecté, chargement du profil...');
        await loadUserProfile(session.user);
      }
      else if (event === 'INITIAL_SESSION' && session?.user) {
        ('🔄 Session initiale détectée, chargement du profil...');
        await loadUserProfile(session.user);
      }
      else if (session?.user) {
        ('👤 Session user présente, chargement du profil...');
        await loadUserProfile(session.user);
      } 
      else {
        ('❌ Pas de session user, nettoyage...');
        setUser(null);
      }
      
      ('✅ onAuthStateChange terminé');
    } catch (error) {
      console.error('❌ ERREUR dans onAuthStateChange:', error);
    }
  }
);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Connexion
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

// Inscription
const signUp = async (
  email: string, 
  password: string, 
  role: 'organisation' | ' member' | 'client'
) => {
  ('🔧 useAuth.signUp() - Début');
  
  // 1. Créer le compte auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  ('📝 Résultat auth.signUp:', { data, error });

  if (error) {
    console.error('❌ Erreur auth.signUp:', error);
    throw error;
  }

  if (!data.user) {
    throw new Error('Erreur lors de la création du compte');
  }

('✅ Compte auth créé:', data.user.id);

// 2. Créer ou mettre à jour le profil
('📝 Vérification du profil dans la table profiles...');

// D'abord, vérifier si le profil existe déjà
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id, role')
  .eq('email', email)
  

if (existingProfile) {
  // Le profil existe déjà (cas member créé par l'organisation)
  ('✅ Profil existant trouvé, mise à jour de l\'ID auth...');
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      id: data.user.id,  // Mettre à jour avec le vrai ID auth
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (updateError) {
    console.error('❌ Erreur mise à jour profil:', updateError);
    throw new Error(`Erreur mise à jour profil: ${updateError.message}`);
  }
  
  ('✅ Profil mis à jour avec succès');
} else {
  // Le profil n'existe pas (cas organisation qui s'inscrit)
  ('📝 Création du profil dans la table profiles...');
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email: email,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('❌ Erreur création profil:', profileError);
    throw new Error(`Erreur création profil: ${profileError.message}`);
  }
  
  ('✅ Profil créé avec succès');
}

  // 3. SKIP loadUserProfile - on le fera au prochain signIn
  ('⏭️  Skip loadUserProfile (sera chargé au login)');
  
  ('✅ signUp terminé avec succès');
};


  // Déconnexion
const signOut = async () => {
  try {
    ('🚪 Déconnexion...');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    
    // NOUVEAU : Nettoyer localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    ('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    throw error;
  }
};

  // Réinitialiser mot de passe
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  // Mettre à jour le mot de passe
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  
  return context;
}