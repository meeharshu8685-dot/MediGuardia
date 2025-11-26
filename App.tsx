
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SymptomCheckerScreen } from './screens/SymptomCheckerScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { AppIcon } from './constants';
import { BottomNavBar } from './components/BottomNavBar';
import { UserProfile, MedicalDocument, HealthLog, Medication } from './types';
import { mockUser, mockDocs, mockHealthLogs, mockMedications } from './data/mock';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getMedicalProfile, saveMedicalProfile, MedicalProfileData } from './services/medicalProfileService';
import { getMedications, addMedication as saveMedication, updateMedication, deleteMedication } from './services/medicationService';
import { getHealthLogs, addHealthLog as saveHealthLog, updateHealthLog, deleteHealthLog } from './services/healthLogService';
import { supabase } from './lib/supabase';


type AppState = 'splash' | 'onboarding' | 'auth' | 'main';
export type MainTab = 'home' | 'symptom' | 'sos' | 'history' | 'profile';

const SplashScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-[#7B61FF] to-[#9DBBFF]">
        <div className="flex flex-col items-center justify-center flex-grow">
            <div className="w-24 h-24 mb-4 text-white">
                <AppIcon />
            </div>
            <h1 className="text-4xl font-bold text-white">MediGuardia</h1>
            <p className="text-lg text-white/90 mt-2">Your Personal AI Health Companion</p>
        </div>
        <div className="mb-16">
            <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
        </div>
    </div>
);

const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const [appState, setAppState] = useState<AppState>('splash');
    const [activeTab, setActiveTab] = useState<MainTab>('home');
    const [view, setView] = useState<string>('home');
    const hasInitialized = useRef(false);
    const isOAuthCallback = useRef(false);

    // Centralized Application State
    const [userProfile, setUserProfile] = useState<UserProfile>(mockUser);
    const [documents, setDocuments] = useState<MedicalDocument[]>(mockDocs);
    const [healthLogs, setHealthLogs] = useState<HealthLog[]>(mockHealthLogs);
    const [medications, setMedications] = useState<Medication[]>(mockMedications);

    useEffect(() => {
        // Check for Supabase OAuth callback in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasOAuthCallback = hashParams.get('access_token') || hashParams.get('error');

        if (hasOAuthCallback) {
            console.log('OAuth callback detected, waiting for session...');
            // Mark that we're in OAuth callback state
            isOAuthCallback.current = true;
            // Clear hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            // OAuth callback detected - wait for auth state to update
            // The AuthContext will handle the session automatically via onAuthStateChange
            // Also manually trigger a session check after a short delay
            setTimeout(async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        console.log('OAuth session found after callback');
                        // The onAuthStateChange will handle setting the user
                    }
                } catch (error) {
                    console.error('Error checking OAuth session:', error);
                }
            }, 500);
            return;
        }
        
        // If we're waiting for OAuth callback to complete
        if (isOAuthCallback.current) {
            // Wait for authentication to be established, but with a timeout
            if (isLoading || !isAuthenticated) {
                console.log('Waiting for OAuth session to be established...', { isLoading, isAuthenticated, hasUser: !!user });
                // If we have a user but isLoading is still true, it might be stuck
                // Give it a moment and then proceed
                if (user && isLoading) {
                    // User exists but still loading - might be a race condition
                    // Wait a bit more
                    return;
                }
                // Set a timeout to prevent infinite loading (10 seconds max)
                setTimeout(() => {
                    if (isOAuthCallback.current && (!isAuthenticated || isLoading)) {
                        console.warn('OAuth callback timeout, clearing flag');
                        isOAuthCallback.current = false;
                    }
                }, 10000);
                return; // Still waiting
            }
            // OAuth callback completed, user is authenticated
            console.log('OAuth callback completed, user authenticated');
            isOAuthCallback.current = false;
            // Fall through to set app state to main
        }

        // Wait for auth to finish loading before deciding app state
        if (isLoading) {
            // If we have a user but still loading, don't reset to auth
            if (user && appState === 'main') {
                return; // Keep main screen if user exists
            }
            return; // Still loading, keep current screen
        }

        // Once loading is complete, check authentication state
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        
        // Determine the target state based on authentication
        let targetState: AppState;
        
        if (!onboardingCompleted) {
            targetState = 'onboarding';
        } else if (isAuthenticated) {
            targetState = 'main';
        } else {
            targetState = 'auth';
        }
        
        // Critical: Never reset from main to auth if user is authenticated
        if (appState === 'main' && isAuthenticated) {
            // User is in main and authenticated - never reset to auth
            console.log('User authenticated in main, preventing reset');
            return;
        }
        
        // If authenticated and not in main, go to main
        if (isAuthenticated && appState !== 'main') {
            console.log('User authenticated, transitioning to main');
            setAppState('main');
            hasInitialized.current = true;
            isOAuthCallback.current = false; // Clear OAuth callback flag
            return;
        }
        
        // If not authenticated and in main, go to auth (user logged out)
        if (!isAuthenticated && appState === 'main') {
            console.log('User not authenticated in main, going to auth');
            setAppState('auth');
            hasInitialized.current = true;
            return;
        }
        
        // Only update state if:
        // 1. We haven't initialized yet, OR
        // 2. The target state is different from current state, OR
        // 3. We're in splash screen (initial load)
        if (!hasInitialized.current || appState !== targetState || appState === 'splash') {
            console.log('Updating app state:', appState, '->', targetState);
            setAppState(targetState);
            hasInitialized.current = true;
        }
    }, [isAuthenticated, isLoading]);

    // Load all user data from Firebase when authenticated
    // This runs in the background and doesn't block the UI
    useEffect(() => {
        const loadUserData = async () => {
            if (isAuthenticated && user && !isLoading) {
                try {
                    // Load medical profile
                    const profile = await getMedicalProfile();
                    if (profile) {
                        setUserProfile(profile);
                    } else {
                        // If no profile exists, use basic user info
                        setUserProfile({
                            ...mockUser,
                            name: user.name,
                            email: user.email,
                            avatarUrl: user.avatarUrl || mockUser.avatarUrl
                        });
                    }

                    // Load medications (don't block if this fails)
                    try {
                        const userMedications = await getMedications();
                        if (userMedications.length > 0) {
                            setMedications(userMedications);
                        }
                    } catch (medError) {
                        console.warn('Error loading medications:', medError);
                    }

                    // Load health logs (don't block if this fails)
                    try {
                        const userHealthLogs = await getHealthLogs();
                        if (userHealthLogs.length > 0) {
                            setHealthLogs(userHealthLogs);
                        }
                    } catch (logError) {
                        console.warn('Error loading health logs:', logError);
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    // Even if profile loading fails, set basic user info
                    setUserProfile({
                        ...mockUser,
                        name: user.name,
                        email: user.email,
                        avatarUrl: user.avatarUrl || mockUser.avatarUrl
                    });
                }
            }
        };

        loadUserData();
    }, [isAuthenticated, user, isLoading]);

    // State Handler Functions
    const handleUpdateProfile = async (updatedProfile: UserProfile) => {
        // Save to Firebase
        const profileData: MedicalProfileData = {
            full_name: updatedProfile.name,
            age: updatedProfile.age,
            gender: undefined, // Add if you have gender field
            blood_group: updatedProfile.bloodGroup as any,
            allergies: updatedProfile.allergies,
            chronic_conditions: updatedProfile.chronicConditions,
            emergency_contact_name: updatedProfile.emergencyContact?.name,
            emergency_contact_phone: updatedProfile.emergencyContact?.phone,
            height: updatedProfile.height,
            weight: updatedProfile.weight,
            avatar_url: updatedProfile.avatarUrl,
        };

        const result = await saveMedicalProfile(profileData);
        
        if (result.success) {
            setUserProfile(updatedProfile);
            setShowEditModal(false);
        } else {
            console.error('Failed to save profile:', result.error);
            // Still update local state even if save fails
            setUserProfile(updatedProfile);
            setShowEditModal(false);
        }
    };
    
    const handleAddHealthLog = async (log: Omit<HealthLog, 'id' | 'date'>) => {
        // Save to Firebase
        const result = await saveHealthLog(log);
        
        if (result.success && result.id) {
            const newLog: HealthLog = {
                ...log,
                id: result.id,
                date: new Date().toISOString().split('T')[0],
            };
            setHealthLogs(prev => [newLog, ...prev]);
        } else {
            // Fallback: save locally if Firebase fails
            console.warn('Failed to save health log to Firebase, saving locally:', result.error);
            const newLog: HealthLog = {
                ...log,
                id: `local-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
            };
            setHealthLogs(prev => [newLog, ...prev]);
        }
    };

    const handleAddMedication = async (med: Omit<Medication, 'id'>) => {
        // Save to Firebase
        const result = await saveMedication(med);
        
        if (result.success && result.id) {
            const newMed: Medication = {
                ...med,
                id: result.id,
            };
            setMedications(prev => [...prev, newMed]);
        } else {
            // Fallback: save locally if Firebase fails
            console.warn('Failed to save medication to Firebase, saving locally:', result.error);
            const newMed: Medication = {
                ...med,
                id: `local-${Date.now()}`,
            };
            setMedications(prev => [...prev, newMed]);
        }
    };

    const handleLoginSuccess = () => {
        // Reset initialization flag to allow state update after login
        hasInitialized.current = false;
        // The useEffect will handle the state transition when isAuthenticated changes
    };

    const handleOnboardingComplete = () => {
        localStorage.setItem('onboardingCompleted', 'true');
        setAppState('auth');
    };
    
    const navigate = useCallback((newView: string) => {
        setView(newView);
    }, []);

    const [showEditModal, setShowEditModal] = useState(false);

    const renderMainScreen = () => {
        const screenProps = { navigate, setView };

        if (view === 'chat_coming_soon') {
            return <ComingSoonScreen featureName="Live Doctor Chat" onBack={() => { setActiveTab('home'); setView('home'); }} />;
        }
        if (view === 'subscription_coming_soon') {
            return <ComingSoonScreen featureName="Subscription Plans" onBack={() => { setActiveTab('profile'); setView('profile'); }} />;
        }

        switch (activeTab) {
            case 'home':
                return <HomeScreen {...screenProps} setActiveTab={setActiveTab} user={userProfile} medications={medications} logs={healthLogs} />;
            case 'symptom':
                return <SymptomCheckerScreen {...screenProps} onSaveLog={handleAddHealthLog} />;
            case 'sos':
                return <EmergencyScreen {...screenProps} view={view} user={userProfile} />;
            case 'history':
                return (
                    <HistoryScreen 
                        {...screenProps} 
                        view={view} 
                        logs={healthLogs} 
                        medications={medications} 
                        onAddMedication={handleAddMedication}
                        onDeleteLog={async (logId: string) => {
                            const result = await deleteHealthLog(logId);
                            if (result.success) {
                                setHealthLogs(prev => prev.filter(log => log.id !== logId));
                            }
                        }}
                        onUpdateLog={async (logId: string, updates: Partial<HealthLog>) => {
                            const result = await updateHealthLog(logId, updates);
                            if (result.success) {
                                setHealthLogs(prev => prev.map(log => 
                                    log.id === logId ? { ...log, ...updates } : log
                                ));
                            }
                        }}
                    />
                );
            case 'profile':
                return <ProfileScreen {...screenProps} user={userProfile} docs={documents} onUpdateProfile={handleUpdateProfile} onLogout={() => { logout(); setAppState('auth'); }} />;
            default:
                return <HomeScreen {...screenProps} user={userProfile} medications={medications} logs={healthLogs} />;
        }
    };

    const renderContent = () => {
        switch (appState) {
            case 'splash':
                return <SplashScreen />;
            case 'onboarding':
                return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'auth':
                return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
            case 'main':
                return (
                    <div className="w-full min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
                        <main className="pb-28">{renderMainScreen()}</main>
                        <BottomNavBar activeTab={activeTab} setActiveTab={(tab) => {
                            setActiveTab(tab);
                            setView(tab);
                        }} />
                    </div>
                );
            default:
                return <SplashScreen />;
        }
    };

    if (isLoading) {
        return (
            <ThemeProvider>
                <div className="w-screen h-screen overflow-x-hidden flex items-center justify-center">
                    <SplashScreen />
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <div className="w-screen h-screen overflow-x-hidden">{renderContent()}</div>
        </ThemeProvider>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
