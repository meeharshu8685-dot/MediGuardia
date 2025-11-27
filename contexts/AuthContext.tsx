import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
    const isInitialCheckRef = useRef(true);
    const hasUserRef = useRef(false);

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    const appUser = await convertSupabaseUser(session.user);
                    setUser(appUser);
                    hasUserRef.current = true;
                    setIsLoading(false);
                    console.log('Session found on load:', appUser.email);
                } else {
                    // Check if there's a hash in URL (OAuth callback)
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const hasOAuthCallback = hashParams.get('access_token');
                    
                    if (hasOAuthCallback) {
                        // OAuth callback detected - wait for onAuthStateChange to handle it
                        console.log('OAuth callback in URL, waiting for onAuthStateChange');
                        // Don't set isLoading to false yet - let onAuthStateChange handle it
                    } else {
                        setIsLoading(false);
                        console.log('No session found on load');
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setIsLoading(false);
            } finally {
                // Mark that initial check is done after a delay
                setTimeout(() => {
                    isInitialCheckRef.current = false;
                    console.log('Initial check phase completed');
                }, 2000);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email, 'hasUser:', hasUserRef.current, 'isInitialCheck:', isInitialCheckRef.current);
            
            // Handle SIGNED_OUT event
            if (event === 'SIGNED_OUT') {
                setUser(null);
                hasUserRef.current = false;
                setIsLoading(false);
                return;
            }
            
            // Handle TOKEN_REFRESHED without session
            if (event === 'TOKEN_REFRESHED' && !session) {
                // Only clear if we're not in initial check and user was set
                if (!isInitialCheckRef.current) {
                    setUser(null);
                    hasUserRef.current = false;
                }
                setIsLoading(false);
                return;
            }
            
            // Handle TOKEN_REFRESHED event (can happen during OAuth) - check for session
            if (event === 'TOKEN_REFRESHED' && session?.user) {
                const appUser = await convertSupabaseUser(session.user);
                setUser(appUser);
                hasUserRef.current = true;
                setIsLoading(false);
                console.log('TOKEN_REFRESHED event with session, user set:', appUser.email);
                return;
            }
            
            // Handle sessions with user - ALWAYS set user if session exists
            if (session?.user) {
                const appUser = await convertSupabaseUser(session.user);
                setUser(appUser);
                hasUserRef.current = true;
                setIsLoading(false);
                return;
            }
            
            // For INITIAL_SESSION event without session
            if (event === 'INITIAL_SESSION') {
                // Don't clear user on initial session if we have a user and are in initial check
                if (isInitialCheckRef.current && hasUserRef.current) {
                    console.log('INITIAL_SESSION during initial check with user, not clearing');
                    setIsLoading(false);
                    return;
                }
                // If no user was found, it's safe to clear
                if (!hasUserRef.current) {
                    setUser(null);
                }
                setIsLoading(false);
                return;
            }
            
            // For USER_UPDATED events without session - don't clear
            if (event === 'USER_UPDATED') {
                // This event should have a session, but if not, don't clear user
                setIsLoading(false);
                return;
            }
            
            // For other events without session, only clear if not initial check and no user
            if (!isInitialCheckRef.current && !hasUserRef.current) {
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
            setIsLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setIsLoading(false);
                return { success: false, error: error.message };
            }

            if (data.user && data.session) {
                // Immediately set user to prevent any race conditions
                const appUser = await convertSupabaseUser(data.user);
                setUser(appUser);
                hasUserRef.current = true;
                // Set isLoading to false immediately since we have the user and session
                // onAuthStateChange will also handle it as a backup, but we don't rely on it
                setIsLoading(false);
                console.log('Login successful, user set:', appUser.email);
                return { success: true };
            }

            setIsLoading(false);
            return { success: false, error: 'Login failed - no session' };
        } catch (error: any) {
            console.error('Login error:', error);
            setIsLoading(false);
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
