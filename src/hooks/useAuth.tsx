import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  organizationId?: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;
      if (!profile) throw new Error('Profile not found');

      // Update last login (non-blocking)
      supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', supabaseUser.id);

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: profile.role,
        organizationId: profile.organization_id,
        organizationName: profile.organization_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      
      // Fallback: temporary profile
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: 'admin',
        organizationId: undefined,
        organizationName: undefined,
        firstName: undefined,
        lastName: undefined,
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        }
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (err) {
        console.error('Session check error:', err);
        localStorage.clear();
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.clear();
            sessionStorage.clear();
          } else if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) await loadUserProfile(data.user);
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'admin' | 'member' | 'viewer'
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Account creation failed');

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .single();

    if (existingProfile) {
      // Update existing profile with auth ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          id: data.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }
    } else {
      // Create new profile
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
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
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

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}