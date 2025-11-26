
import React from 'react';
import { UserProfile, Medication, HealthLog } from '../types';
import { StethoscopeIcon, SosIcon, FirstAidIcon, HospitalIcon, ChatIcon, ChevronRightIcon, PillIcon } from '../constants';

const Header: React.FC<{ user: UserProfile }> = ({ user }) => (
    <div className="p-6 pt-12 bg-neutral-100">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                <div className="ml-4">
                    <p className="text-lg text-neutral-500">Welcome back,</p>
                    <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
                </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </button>
        </div>
    </div>
);

const QuickTile: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
    <div onClick={onClick} className={`rounded-3xl p-4 flex flex-col justify-between h-32 shadow-md cursor-pointer transition-transform hover:scale-105 ${color}`}>
        <div className="w-10 h-10 text-white">{icon}</div>
        <p className="font-bold text-white text-lg">{label}</p>
    </div>
);

const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
        {onSeeAll && <button onClick={onSeeAll} className="text-sm font-semibold text-primary">See All</button>}
    </div>
);

const MedicationCard: React.FC<{ medication: Medication }> = ({ medication }) => (
    <div className="bg-white p-4 rounded-2xl flex items-center shadow-sm">
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mr-4 text-primary">
            <PillIcon />
        </div>
        <div>
            <p className="font-bold text-neutral-800">{medication.name}</p>
            <p className="text-sm text-neutral-500">{medication.dosage} - {medication.time}</p>
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
    return (
        <div className="min-h-screen bg-neutral-100">
            <Header user={user} />
            
            <div className="p-6 space-y-8">
                {/* Quick Tiles Section */}
                <div className="grid grid-cols-2 gap-4">
                    <QuickTile icon={<StethoscopeIcon />} label="Symptom Check" onClick={() => setView('symptom')} color="bg-gradient-to-br from-purple-500 to-primary" />
                    <QuickTile icon={<FirstAidIcon />} label="First Aid" onClick={() => setView('sos/first-aid')} color="bg-gradient-to-br from-green-500 to-accent-green" />
                    <QuickTile icon={<SosIcon />} label="SOS" onClick={() => setView('sos/sos')} color="bg-gradient-to-br from-red-500 to-accent-red" />
                    <QuickTile icon={<HospitalIcon />} label="Hospitals" onClick={() => setView('sos/hospitals')} color="bg-gradient-to-br from-blue-500 to-accent-blue" />
                </div>
                
                 {/* Premium Chat Card */}
                 <div className="bg-white p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer" onClick={() => navigate('chat_coming_soon')}>
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mr-4 text-primary"><ChatIcon /></div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800">Chat with a Doctor</h3>
                            <p className="text-sm text-neutral-500">Get expert advice, instantly.</p>
                        </div>
                    </div>
                    <div className="text-neutral-400">
                        <ChevronRightIcon />
                    </div>
                </div>

                {/* Your Medications Today */}
                <section>
                    <SectionHeader title="Your Medications Today" onSeeAll={() => setView('history/medications')} />
                     {medications.length > 0 ? (
                        <div className="space-y-3">
                            {medications.slice(0, 2).map(med => <MedicationCard key={med.id} medication={med} />)}
                        </div>
                     ) : (
                        <div className="text-center py-4 bg-white rounded-2xl text-neutral-500">No medications for today.</div>
                     )}
                </section>
                
                {/* Recent Health Logs */}
                <section>
                    <SectionHeader title="Recent Health Logs" onSeeAll={() => setView('history/timeline')} />
                     {logs.length > 0 ? (
                        <div className="bg-white p-4 rounded-2xl space-y-1 shadow-sm">
                            {logs.slice(0, 2).map(log => (
                                <div key={log.id} className="flex justify-between items-center py-2">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-xl ${log.severity === 'Minor' ? 'bg-green-100 text-green-700' : log.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.symptom.includes('Headache') ? '🤕' : log.symptom.includes('Cough') ? '😷' : '🤧'}
                                        </div>
                                        <div>
                                            <p className="font-bold">{log.symptom}</p>
                                            <p className="text-sm text-neutral-500">{log.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${log.severity === 'Minor' ? 'bg-green-100 text-green-800' : log.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{log.severity}</span>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-4 bg-white rounded-2xl text-neutral-500">No recent health logs.</div>
                     )}
                </section>
            </div>
        </div>
    );
};
