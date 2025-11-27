import React from 'react';
import { MainTab } from '../App';
import { HomeIcon, ScheduleIcon, HistoryIcon, NotificationIcon } from '../constants';

interface BottomNavBarProps {
    activeTab: MainTab;
    setActiveTab: (tab: MainTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
    const navItems: { id: MainTab; icon: React.ReactNode; label: string }[] = [
        { id: 'home', icon: <HomeIcon />, label: 'Home' },
        { id: 'schedule', icon: <ScheduleIcon />, label: 'Schedule' },
        { id: 'history', icon: <HistoryIcon />, label: 'Report' },
        { id: 'notifications', icon: <NotificationIcon />, label: 'Notifications' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-20">
                 {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300"
                    >
                        <div className={`w-6 h-6 transition-colors duration-300 mb-1 ${activeTab === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-xs font-medium transition-colors ${activeTab === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
