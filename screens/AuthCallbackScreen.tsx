import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthCallbackScreenProps {
    onAuthComplete: () => void;
    onAuthError: () => void;
}

export const AuthCallbackScreen: React.FC<AuthCallbackScreenProps> = ({ onAuthComplete, onAuthError }) => {
    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Check for OAuth callback in URL hash
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const error = hashParams.get('error');

                if (error) {
                    console.error('OAuth error:', error);
                    onAuthError();
                    return;
                }

                if (accessToken) {
                    // Get the session
                    const { data, error: sessionError } = await supabase.auth.getSession();
                    
                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        onAuthError();
                        return;
                    }

                    if (data.session) {
                        // Successfully authenticated
                        // Clear the hash from URL
                        window.history.replaceState(null, '', window.location.pathname);
                        onAuthComplete();
                    } else {
                        onAuthError();
                    }
                } else {
                    // No OAuth callback, check existing session
                    const { data } = await supabase.auth.getSession();
                    if (data.session) {
                        onAuthComplete();
                    } else {
                        onAuthError();
                    }
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                onAuthError();
            }
        };

        handleAuthCallback();
    }, [onAuthComplete, onAuthError]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Completing authentication...</p>
            </div>
        </div>
    );
};

