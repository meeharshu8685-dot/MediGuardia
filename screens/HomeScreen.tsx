import React, { useState } from 'react';
import { UserProfile, Medication, HealthLog } from '../types';
import { StethoscopeIcon, SosIcon, FirstAidIcon, HospitalIcon, HistoryIcon } from '../constants';
import { QuoteComponent } from '../features/quotes/QuoteComponent';

interface Appointment {
    id: string;
    date: string;
    day: string;
    time: string;
    doctorName: string;
    reason: string;
    color: string;
}

const mockAppointments: Appointment[] = [
    { id: '1', date: '12', day: 'Tue', time: '09:30 AM', doctorName: 'Dr. Mim Akhter', reason: 'Depression', color: 'bg-blue-500' },
    { id: '2', date: '13', day: 'We', time: '10:00 AM', doctorName: 'Dr. John Smith', reason: 'Checkup', color: 'bg-orange-500' },
];

const Header: React.FC<{ user: UserProfile; onNotificationClick?: () => void; onSettingsClick?: () => void; onProfileClick?: () => void }> = ({ user, onNotificationClick, onSettingsClick, onProfileClick }) => {
    const [hasNotifications, setHasNotifications] = useState(true);

    return (
        <div className="p-6 pt-12 bg-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center flex-1">
                    <div className="relative">
                        <button
                            onClick={onProfileClick}
                            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full"
                        >
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" 
                            />
                        </button>
                        {hasNotifications && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm text-gray-500">Hello!</p>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    </div>
                </div>
                <button 
                    onClick={onSettingsClick}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search medical..."
                    className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const ServiceCard: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
    bgColor: string;
    iconColor: string;
}> = ({ icon, label, onClick, bgColor, iconColor }) => (
    <div 
        onClick={onClick} 
        className={`${bgColor} rounded-2xl p-4 flex flex-col items-center justify-center h-24 cursor-pointer transition-transform hover:scale-105 shadow-sm border border-gray-200`}
    >
        <div className={`${iconColor} mb-2`}>
            {icon}
        </div>
        <p className={`text-xs font-semibold ${iconColor} text-center`}>{label}</p>
    </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment; onClick?: () => void }> = ({ appointment, onClick }) => (
    <div 
        onClick={onClick}
        className={`${appointment.color} rounded-2xl p-4 min-w-[160px] mr-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
    >
        <div className="flex items-start justify-between mb-2">
            <div>
                <p className="text-white font-bold text-lg">{appointment.date}</p>
                <p className="text-white/90 text-sm">{appointment.day}</p>
            </div>
        </div>
        <div className="mt-3">
            <p className="text-white/90 text-xs mb-1">{appointment.time}</p>
            <p className="text-white font-semibold text-sm">{appointment.doctorName}</p>
            <p className="text-white/80 text-xs mt-1">{appointment.reason}</p>
        </div>
    </div>
);

interface HomeScreenProps {
    navigate: (view: string) => void;
    setView: (view: string) => void;
    setActiveTab?: (tab: 'home' | 'symptom' | 'sos' | 'history' | 'profile') => void;
    user: UserProfile;
    medications: Medication[];
    logs: HealthLog[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigate, setView, setActiveTab, user, medications, logs }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <Header 
                user={user} 
                onSettingsClick={() => setView('settings')} 
                onProfileClick={() => navigate('profile')}
            />
            
            <div className="px-6 space-y-6">
                {/* Services Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Services</h2>
                    <div className="grid grid-cols-4 gap-3">
                        <ServiceCard
                            icon={<StethoscopeIcon />} 
                            label="Symptom Checker"
                            onClick={() => {
                                navigate('symptom-checker');
                            }} 
                            bgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <ServiceCard
                            icon={<FirstAidIcon />}
                            label="First Aid"
                            onClick={() => {
                                navigate('sos/first-aid');
                            }} 
                            bgColor="bg-red-100"
                            iconColor="text-red-600"
                        />
                        <ServiceCard
                            icon={<SosIcon />}
                            label="SOS"
                            onClick={() => {
                                navigate('sos/sos');
                            }} 
                            bgColor="bg-orange-100"
                            iconColor="text-orange-600"
                        />
                        <ServiceCard
                            icon={<HospitalIcon />}
                            label="Hospitals"
                            onClick={() => {
                                navigate('hospitals');
                            }} 
                            bgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-3">
                        <ServiceCard
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            }
                            label="Medications"
                            onClick={() => {
                                navigate('medications');
                            }} 
                            bgColor="bg-yellow-100"
                            iconColor="text-yellow-600"
                        />
                        <ServiceCard
                            icon={<HistoryIcon />}
                            label="History"
                            onClick={() => {
                                setActiveTab?.('history');
                                setView('history');
                            }} 
                            bgColor="bg-purple-100"
                            iconColor="text-purple-600"
                        />
                        <ServiceCard
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                            }
                            label="Documents"
                            onClick={() => {
                                navigate('documents');
                            }} 
                            bgColor="bg-cyan-100"
                            iconColor="text-cyan-600"
                        />
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
                    <div className="flex overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                        {mockAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onClick={() => {
                                    // Navigate to appointment details
                                    alert(`Appointment with ${appointment.doctorName} on ${appointment.date} ${appointment.day} at ${appointment.time}`);
                                }}
                                />
                            ))}
                        </div>
                </div>

                {/* Rotating Positive Quote Component */}
                <div className="mt-6">
                    <QuoteComponent />
                </div>
            </div>
        </div>
    );
};
