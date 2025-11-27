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

// Plant leaf pattern for loading screen (matching login theme)
const LoadingLeafPattern = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <svg className="absolute w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
            <defs>
                <pattern id="loadingLeafPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                    <path
                        d="M100,30 Q120,60 140,100 Q150,130 140,160 Q130,180 100,200 Q70,180 60,160 Q50,130 60,100 Q80,60 100,30 Z"
                        fill="#0d4a2e"
                        opacity="0.2"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#1a5f3f" />
            <rect width="100%" height="100%" fill="url(#loadingLeafPattern)" />
            {/* Large decorative leaves */}
            <path
                d="M50,50 Q80,70 100,110 Q110,150 100,190 Q90,210 50,230 Q10,210 0,190 Q-10,150 0,110 Q20,70 50,50 Z"
                fill="#0d4a2e"
                opacity="0.3"
            />
            <path
                d="M350,80 Q380,100 400,140 Q410,180 400,220 Q390,240 350,260 Q310,240 300,220 Q290,180 300,140 Q320,100 350,80 Z"
                fill="#0d4a2e"
                opacity="0.3"
            />
            <path
                d="M150,300 Q180,320 200,360 Q210,400 200,440 Q190,460 150,480 Q110,460 100,440 Q90,400 100,360 Q120,320 150,300 Z"
                fill="#0d4a2e"
                opacity="0.25"
            />
            <path
                d="M250,500 Q280,520 300,560 Q310,600 300,640 Q290,660 250,680 Q210,660 200,640 Q190,600 200,560 Q220,520 250,500 Z"
                fill="#0d4a2e"
                opacity="0.25"
            />
        </svg>
    </div>
);

const SplashScreen: React.FC = () => {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-[#1a5f3f] overflow-hidden">
            {/* Background pattern */}
            <LoadingLeafPattern />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
                <div className="w-24 h-24 mb-6 text-white">
                    <AppIcon />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">MediGuardia</h1>
                <p className="text-lg text-white/90">Your Personal AI Health Companion</p>
            </div>
            
            {/* Loading spinner */}
            <div className="relative z-10 mb-16">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            
            {/* Decorative leaf branch (matching login screen) */}
            <div className="absolute right-0 top-1/3 opacity-20">
                <svg width="100" height="150" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M60 20 Q70 30 75 45 Q78 55 75 65 Q70 75 60 80 Q50 75 45 65 Q42 55 45 45 Q50 30 60 20 Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M50 40 Q55 50 58 60 Q60 68 58 75 Q55 82 50 85 Q45 82 42 75 Q40 68 42 60 Q45 50 50 40 Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M40 60 Q45 70 48 80 Q50 88 48 95 Q45 102 40 105 Q35 102 32 95 Q30 88 32 80 Q35 70 40 60 Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M30 80 L35 100 L25 100 Z"
                        fill="#ffffff"
                    />
                </svg>
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
