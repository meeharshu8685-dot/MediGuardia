
import React from 'react';
import { MainTab } from '../App';
import { HomeIcon, StethoscopeIcon, SosIcon, HistoryIcon, UserIcon } from '../constants';

interface BottomNavBarProps {
    activeTab: MainTab;
    setActiveTab: (tab: MainTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
    const navItems: { id: MainTab; icon: React.ReactNode }[] = [
        { id: 'home', icon: <HomeIcon /> },
        { id: 'symptom', icon: <StethoscopeIcon /> },
        { id: 'sos', icon: <SosIcon /> },
        { id: 'history', icon: <HistoryIcon /> },
        { id: 'profile', icon: <UserIcon /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg z-50 transition-colors">
            <div className="flex justify-around items-center h-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] rounded-t-3xl mx-2">
                 {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl relative transition-all duration-300"
                    >
                        <div className={`w-8 h-8 transition-colors duration-300 ${activeTab === item.id ? 'text-primary dark:text-primary-light' : 'text-neutral-400 dark:text-neutral-500'}`}>
                            {item.icon}
                        </div>
                        {activeTab === item.id && (
                            <div className="absolute -bottom-1 w-8 h-1 bg-primary dark:bg-primary-light rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
