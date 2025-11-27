import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SymptomCheckerScreen } from './features/symptom-checker/SymptomCheckerScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { HospitalLocatorMapScreen } from './screens/HospitalLocatorMapScreen';
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


type AppState = 'splash' | 'welcome' | 'onboarding' | 'auth' | 'main';
export type MainTab = 'home' | 'schedule' | 'history' | 'notifications';

const SplashScreen: React.FC = () => {
    return (
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
};

const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const [appState, setAppState] = useState<AppState>('splash');
    const [activeTab, setActiveTab] = useState<MainTab>('home');
    const [view, setView] = useState<string>('home');
    const splashShown = useRef(false);

    // Centralized Application State
    const [userProfile, setUserProfile] = useState<UserProfile>(mockUser);
    const [documents, setDocuments] = useState<MedicalDocument[]>(mockDocs);
    const [healthLogs, setHealthLogs] = useState<HealthLog[]>(mockHealthLogs);
    const [medications, setMedications] = useState<Medication[]>(mockMedications);

    // Handle splash screen - show for 1.5 seconds then transition
    useEffect(() => {
        if (!splashShown.current && appState === 'splash') {
            splashShown.current = true;
            const timer = setTimeout(() => {
                // Splash shown, now determine next state
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [appState]);

    // Main authentication and state management effect
    useEffect(() => {
        // Note: We removed the manual hash clearing block here. 
        // Supabase needs the hash to be present to verify the OAuth session.

        // Wait for auth to finish loading (but allow transition if user is already set)
        if (isLoading && !user) {
            return;
        }

        // If authenticated, always go to main
        if (isAuthenticated && user) {
            // Mark onboarding as completed
            localStorage.setItem('onboardingCompleted', 'true');
            localStorage.setItem('welcomeCompleted', 'true');
            
            if (appState !== 'main') {
                console.log('✅ User authenticated, transitioning to main from', appState);
                setAppState('main');
                setView('home');
                setActiveTab('home');
            }
            return;
        }

        // If not authenticated, determine which screen to show
        // Only transition if we're not loading and not authenticated
        if (!isAuthenticated && !isLoading) {
            const welcomeCompleted = localStorage.getItem('welcomeCompleted');
            const onboardingCompleted = localStorage.getItem('onboardingCompleted');
            
            let targetState: AppState = appState;
            
            // Handle splash screen transition
            if (appState === 'splash') {
                if (splashShown.current) {
                    if (!welcomeCompleted) {
                        targetState = 'welcome';
                    } else if (!onboardingCompleted) {
                        targetState = 'onboarding';
                    } else {
                        targetState = 'auth';
                    }
                } else {
                    // Still showing splash, don't transition yet
                    return;
                }
            } 
            // If user logged out from main, go to auth
            else if (appState === 'main') {
                targetState = 'auth';
            }
            // If already in welcome/onboarding/auth, keep it (don't loop)
            else if (appState === 'welcome' || appState === 'onboarding' || appState === 'auth') {
                // Only transition if we're coming from splash
                if (appState !== 'splash') {
                    return; // Keep current state
                }
            }

            if (targetState !== appState) {
                console.log('Transitioning to:', targetState, 'from', appState);
                setAppState(targetState);
            }
        }
    }, [isAuthenticated, isLoading, user, appState]);

    // Load all user data from Firebase when authenticated
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

                    // Load documents (don't block if this fails)
                    try {
                        const { getDocuments } = await import('./features/documents/documentService');
                        const userDocuments = await getDocuments();
                        if (userDocuments.length > 0) {
                            setDocuments(userDocuments);
                        }
                    } catch (docError) {
                        console.warn('Error loading documents:', docError);
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
            gender: undefined,
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
        console.log('✅ handleLoginSuccess called');
        // Mark onboarding and welcome as completed
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('welcomeCompleted', 'true');
        // The useEffect will handle the transition when isAuthenticated becomes true
        // Force a re-check by triggering state update
        if (isAuthenticated && user) {
            console.log('✅ User already authenticated in handleLoginSuccess, transitioning immediately');
            setAppState('main');
            setView('home');
            setActiveTab('home');
        }
    };

    const handleWelcomeComplete = () => {
        localStorage.setItem('welcomeCompleted', 'true');
        setAppState('auth');
    };

    const handleWelcomeSignUp = () => {
        localStorage.setItem('welcomeCompleted', 'true');
        setAppState('auth');
    };

    const handleWelcomeLogin = () => {
        localStorage.setItem('welcomeCompleted', 'true');
        setAppState('auth');
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
            return <ComingSoonScreen featureName="Subscription Plans" onBack={() => { setActiveTab('home'); setView('profile'); }} />;
        }
        if (view === 'settings') {
            return <SettingsScreen {...screenProps} onBack={() => setView('home')} />;
        }
        if (view === 'profile') {
            return <ProfileScreen {...screenProps} user={userProfile} docs={documents} onUpdateProfile={handleUpdateProfile} onLogout={() => { logout(); setAppState('auth'); }} />;
        }
        if (view === 'symptom' || view === 'symptom-checker') {
            return <SymptomCheckerScreen onBack={() => setView('home')} />;
        }
        if (view === 'sos' || view.startsWith('sos/')) {
            return <EmergencyScreen {...screenProps} view={view} user={userProfile} />;
        }
        if (view === 'hospitals') {
            return <HospitalLocatorMapScreen onBack={() => setView('home')} />;
        }
        if (view === 'medications') {
            return (
                <HistoryScreen 
                    {...screenProps} 
                    view="history/medications" 
                    logs={healthLogs} 
                    medications={medications} 
                    user={userProfile}
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
        }
        if (view === 'documents') {
            return <ProfileScreen {...screenProps} user={userProfile} docs={documents} onUpdateProfile={handleUpdateProfile} onLogout={() => { logout(); setAppState('auth'); }} />;
        }

        switch (activeTab) {
            case 'home':
                return <HomeScreen {...screenProps} setActiveTab={setActiveTab} user={userProfile} medications={medications} logs={healthLogs} />;
            case 'schedule':
                return <ScheduleScreen {...screenProps} />;
            case 'history':
                return (
                    <HistoryScreen 
                        {...screenProps} 
                        view={view} 
                        logs={healthLogs} 
                        medications={medications} 
                        user={userProfile}
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
            case 'notifications':
                return <NotificationsScreen {...screenProps} />;
            default:
                return <HomeScreen {...screenProps} user={userProfile} medications={medications} logs={healthLogs} />;
        }
    };

    const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

    const renderContent = () => {
        switch (appState) {
            case 'splash':
                return <SplashScreen />;
            case 'welcome':
                return (
                    <WelcomeScreen
                        onSignUp={() => {
                            setAuthInitialMode('signup');
                            handleWelcomeSignUp();
                        }}
                        onLogin={() => {
                            setAuthInitialMode('login');
                            handleWelcomeLogin();
                        }}
                    />
                );
            case 'onboarding':
                return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'auth':
                return (
                    <AuthScreen
                        onLoginSuccess={handleLoginSuccess}
                        onBack={() => {
                            localStorage.removeItem('welcomeCompleted');
                            setAppState('welcome');
                        }}
                        initialMode={authInitialMode}
                    />
                );
            case 'main':
                return (
                    <div className="w-full min-h-screen bg-gray-50 transition-colors">
                        <main className="pb-28">{renderMainScreen()}</main>
                        <BottomNavBar activeTab={activeTab} setActiveTab={(tab) => {
                            setActiveTab(tab);
                            if (tab === 'history') {
                                setView('history/report');
                            } else {
                                setView(tab);
                            }
                        }} />
                    </div>
                );
            default:
                return <SplashScreen />;
        }
    };

    if (isLoading && !isAuthenticated) {
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
