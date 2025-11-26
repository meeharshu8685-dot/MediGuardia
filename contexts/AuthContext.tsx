import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert Supabase user to app user
const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;

    const name = supabaseUser.user_metadata?.full_name || 
                 supabaseUser.user_metadata?.name || 
                 supabaseUser.email?.split('@')[0] || 
                 'User';
    
    const avatarUrl = supabaseUser.user_metadata?.avatar_url || 
                      supabaseUser.user_metadata?.picture ||
                      `https://i.pravatar.cc/150?u=${supabaseUser.email}`;

    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name,
        avatarUrl
    };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    const appUser = await convertSupabaseUser(session.user);
                    setUser(appUser);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            if (session?.user) {
                const appUser = await convertSupabaseUser(session.user);
                setUser(appUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                const appUser = await convertSupabaseUser(data.user);
                setUser(appUser);
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'An error occurred during login' };
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Validate password
            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        name: name,
                    }
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                const appUser = await convertSupabaseUser(data.user);
                setUser(appUser);
                return { success: true };
            }

            return { success: false, error: 'Signup failed' };
        } catch (error: any) {
            console.error('Signup error:', error);
            return { success: false, error: error.message || 'An error occurred during signup' };
        }
    };

    const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}`,
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // OAuth redirects to provider, so we return success
            // The actual login will be handled by the auth state change listener
            return { success: true };
        } catch (error: any) {
            console.error('Google login error:', error);
            return { success: false, error: error.message || 'Failed to sign in with Google' };
        }
    };

    const loginWithFacebook = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}`,
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // OAuth redirects to provider, so we return success
            // The actual login will be handled by the auth state change listener
            return { success: true };
        } catch (error: any) {
            console.error('Facebook login error:', error);
            return { success: false, error: error.message || 'Failed to sign in with Facebook' };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        if (!user) return;

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: userData.name || user.name,
                    name: userData.name || user.name,
                    avatar_url: userData.avatarUrl || user.avatarUrl,
                }
            });

            if (error) {
                console.error('Update user error:', error);
                return;
            }

            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            signup,
            loginWithGoogle,
            loginWithFacebook,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
