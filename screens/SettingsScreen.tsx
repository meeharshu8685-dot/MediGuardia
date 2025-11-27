import React, { useState } from 'react';
import { BackArrowIcon, SettingsIcon, UserIcon, LockIcon, NotificationIcon, MoonIcon, SunIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onClick?: () => void;
    showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, rightElement, onClick, showArrow = true }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-4 bg-white rounded-2xl mb-3 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    >
        <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 text-blue-600">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{title}</p>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
        {rightElement || (showArrow && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        ))}
    </div>
);

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

interface SettingsScreenProps {
    navigate: (view: string) => void;
    setView: (view: string) => void;
    onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigate, setView, onBack }) => {
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [medicationReminders, setMedicationReminders] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            if (onBack) onBack();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white pt-12 pb-6 px-6">
                <div className="flex items-center mb-6">
                    {onBack && (
                        <button onClick={onBack} className="mr-4 text-gray-700">
                            <BackArrowIcon />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                </div>
            </div>

            <div className="px-6 py-4">
                {/* Account Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Account</h2>
                    <SettingItem
                        icon={<UserIcon />}
                        title="Profile"
                        subtitle={user?.email}
                        onClick={() => {
                            navigate('profile');
                        }}
                    />
                    <SettingItem
                        icon={<LockIcon />}
                        title="Change Password"
                        subtitle="Update your password"
                        onClick={() => {
                            alert('Change password functionality coming soon!');
                        }}
                    />
                </div>

                {/* Notifications Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Notifications</h2>
                    <SettingItem
                        icon={<NotificationIcon />}
                        title="Push Notifications"
                        subtitle="Receive push notifications"
                        rightElement={<ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />}
                        showArrow={false}
                    />
                    <SettingItem
                        icon={<NotificationIcon />}
                        title="Medication Reminders"
                        subtitle="Get reminders for your medications"
                        rightElement={<ToggleSwitch enabled={medicationReminders} onChange={setMedicationReminders} />}
                        showArrow={false}
                    />
                    <SettingItem
                        icon={<NotificationIcon />}
                        title="Appointment Reminders"
                        subtitle="Get reminders for appointments"
                        rightElement={<ToggleSwitch enabled={appointmentReminders} onChange={setAppointmentReminders} />}
                        showArrow={false}
                    />
                </div>

                {/* Privacy & Security Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Privacy & Security</h2>
                    <SettingItem
                        icon={<LockIcon />}
                        title="Biometric Lock"
                        subtitle="Use fingerprint or face ID"
                        rightElement={<ToggleSwitch enabled={biometricEnabled} onChange={setBiometricEnabled} />}
                        showArrow={false}
                    />
                    <SettingItem
                        icon={<LockIcon />}
                        title="Privacy Policy"
                        onClick={() => {
                            alert('Privacy Policy');
                        }}
                    />
                    <SettingItem
                        icon={<LockIcon />}
                        title="Terms of Service"
                        onClick={() => {
                            alert('Terms of Service');
                        }}
                    />
                </div>

                {/* App Settings Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">App Settings</h2>
                    <SettingItem
                        icon={darkMode ? <MoonIcon /> : <SunIcon />}
                        title="Dark Mode"
                        subtitle="Switch between light and dark theme"
                        rightElement={<ToggleSwitch enabled={darkMode} onChange={setDarkMode} />}
                        showArrow={false}
                    />
                    <SettingItem
                        icon={<SettingsIcon />}
                        title="Language"
                        subtitle="English"
                        onClick={() => {
                            alert('Language selection coming soon!');
                        }}
                    />
                    <SettingItem
                        icon={<SettingsIcon />}
                        title="About"
                        subtitle="Version 1.0.0"
                        onClick={() => {
                            alert('MediGuardia v1.0.0\nYour Personal AI Health Companion');
                        }}
                    />
                </div>

                {/* Data Management */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Data</h2>
                    <SettingItem
                        icon={<SettingsIcon />}
                        title="Export Data"
                        subtitle="Download your health data"
                        onClick={() => {
                            alert('Export data functionality coming soon!');
                        }}
                    />
                    <SettingItem
                        icon={<SettingsIcon />}
                        title="Clear Cache"
                        subtitle="Free up storage space"
                        onClick={() => {
                            if (confirm('Clear all cached data?')) {
                                alert('Cache cleared!');
                            }
                        }}
                    />
                </div>

                {/* Logout */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

