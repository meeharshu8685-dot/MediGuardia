
import React, { useState } from 'react';
import { UserProfile, Medication, HealthLog } from '../types';
import { StethoscopeIcon, SosIcon, FirstAidIcon, HospitalIcon, ChatIcon, ChevronRightIcon, PillIcon } from '../constants';

const Header: React.FC<{ user: UserProfile; onNotificationClick?: () => void }> = ({ user, onNotificationClick }) => {
    const [hasNotifications, setHasNotifications] = useState(false);
    
    // Check for notifications (medications due, health reminders, etc.)
    React.useEffect(() => {
        // Mock: You can implement real notification logic here
        const checkNotifications = () => {
            // Example: Check if there are medications due today
            setHasNotifications(false); // Set to true if there are notifications
        };
        checkNotifications();
    }, []);

    return (
        <div className="p-6 pt-12 bg-neutral-100 dark:bg-neutral-800 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                    <div className="ml-4">
                        <p className="text-lg text-neutral-500 dark:text-neutral-400">Welcome back,</p>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h1>
                    </div>
                </div>
                <button 
                    onClick={onNotificationClick || (() => alert('No new notifications'))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-sm transition-transform hover:scale-110 relative"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {hasNotifications && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-neutral-700"></span>
                    )}
                </button>
            </div>
        </div>
    );
};

const QuickTile: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
    <div onClick={onClick} className={`rounded-3xl p-4 flex flex-col justify-between h-32 shadow-md cursor-pointer transition-transform hover:scale-105 ${color}`}>
        <div className="w-10 h-10 text-white">{icon}</div>
        <p className="font-bold text-white text-lg">{label}</p>
    </div>
);

const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{title}</h2>
        {onSeeAll && (
            <button 
                onClick={onSeeAll} 
                className="text-sm font-semibold text-primary dark:text-primary-light hover:underline"
            >
                See All
            </button>
        )}
    </div>
);

const MedicationCard: React.FC<{ medication: Medication; onClick?: () => void }> = ({ medication, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-neutral-800 p-4 rounded-2xl flex items-center shadow-sm transition-colors ${onClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700' : ''}`}
    >
        <div className="w-12 h-12 bg-primary-light dark:bg-primary/20 rounded-xl flex items-center justify-center mr-4 text-primary">
            <PillIcon />
        </div>
        <div>
            <p className="font-bold text-neutral-800 dark:text-neutral-200">{medication.name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{medication.dosage} - {medication.time}</p>
        </div>
    </div>
);

interface HomeScreenProps {
    navigate: (view: string) => void;
    setView: (view: string) => void;
    user: UserProfile;
    medications: Medication[];
    logs: HealthLog[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigate, setView, user, medications, logs }) => {
    const handleNotificationClick = () => {
        // Navigate to notifications or show notification list
        alert('Notifications feature coming soon!\n\nYou can check:\n- Medication reminders\n- Health log reminders\n- Appointment alerts');
    };

    const handleMedicationClick = (medication: Medication) => {
        // Navigate to medication detail or edit
        setView('history/medications');
    };

    const handleLogClick = (log: HealthLog) => {
        // Navigate to log detail
        setView('history/timeline');
        // The HistoryScreen will handle showing the detail
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
            <Header user={user} onNotificationClick={handleNotificationClick} />
            
            <div className="p-6 space-y-8">
                {/* Quick Tiles Section */}
                <div className="grid grid-cols-2 gap-4">
                    <QuickTile icon={<StethoscopeIcon />} label="Symptom Check" onClick={() => setView('symptom')} color="bg-gradient-to-br from-purple-500 to-primary" />
                    <QuickTile icon={<FirstAidIcon />} label="First Aid" onClick={() => setView('sos/first-aid')} color="bg-gradient-to-br from-green-500 to-accent-green" />
                    <QuickTile icon={<SosIcon />} label="SOS" onClick={() => setView('sos/sos')} color="bg-gradient-to-br from-red-500 to-accent-red" />
                    <QuickTile icon={<HospitalIcon />} label="Hospitals" onClick={() => setView('sos/hospitals')} color="bg-gradient-to-br from-blue-500 to-accent-blue" />
                </div>
                
                 {/* Premium Chat Card */}
                 <div 
                    className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => navigate('chat_coming_soon')}
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-light dark:bg-primary/20 rounded-xl flex items-center justify-center mr-4 text-primary"><ChatIcon /></div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Chat with a Doctor</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Get expert advice, instantly.</p>
                        </div>
                    </div>
                    <div className="text-neutral-400 dark:text-neutral-500">
                        <ChevronRightIcon />
                    </div>
                </div>

                {/* Your Medications Today */}
                <section>
                    <SectionHeader title="Your Medications Today" onSeeAll={() => setView('history/medications')} />
                     {medications.length > 0 ? (
                        <div className="space-y-3">
                            {medications.slice(0, 2).map(med => (
                                <MedicationCard 
                                    key={med.id} 
                                    medication={med} 
                                    onClick={() => handleMedicationClick(med)}
                                />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-4 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 dark:text-neutral-400">No medications for today.</div>
                     )}
                </section>
                
                {/* Recent Health Logs */}
                <section>
                    <SectionHeader title="Recent Health Logs" onSeeAll={() => setView('history/timeline')} />
                     {logs.length > 0 ? (
                        <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl space-y-1 shadow-sm">
                            {logs.slice(0, 2).map(log => (
                                <div 
                                    key={log.id} 
                                    onClick={() => handleLogClick(log)}
                                    className="flex justify-between items-center py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg px-2 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-xl ${log.severity === 'Minor' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : log.severity === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                            {log.symptom.includes('Headache') ? '🤕' : log.symptom.includes('Cough') ? '😷' : '🤧'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-800 dark:text-neutral-200">{log.symptom}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{log.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${log.severity === 'Minor' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : log.severity === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>{log.severity}</span>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-4 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 dark:text-neutral-400">No recent health logs.</div>
                     )}
                </section>
            </div>
        </div>
    );
};
