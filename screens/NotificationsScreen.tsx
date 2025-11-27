import React, { useState } from 'react';

interface Notification {
    id: string;
    type: 'medication' | 'appointment' | 'health' | 'reminder';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: string;
    color: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Time to take your morning medication',
        time: '2 hours ago',
        read: false,
        icon: '💊',
        color: 'bg-yellow-100'
    },
    {
        id: '2',
        type: 'appointment',
        title: 'Appointment Reminder',
        message: 'You have an appointment with Dr. Mim Akhter tomorrow at 09:30 AM',
        time: '5 hours ago',
        read: false,
        icon: '📅',
        color: 'bg-blue-100'
    },
    {
        id: '3',
        type: 'health',
        title: 'Health Check Reminder',
        message: 'Don\'t forget to log your daily health status',
        time: '1 day ago',
        read: true,
        icon: '❤️',
        color: 'bg-red-100'
    },
    {
        id: '4',
        type: 'reminder',
        title: 'Weekly Report Available',
        message: 'Your weekly health report is ready to view',
        time: '2 days ago',
        read: true,
        icon: '📊',
        color: 'bg-green-100'
    },
];

const NotificationCard: React.FC<{ notification: Notification; onClick?: () => void }> = ({ notification, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-2xl p-4 mb-3 cursor-pointer transition-shadow hover:shadow-md ${
            !notification.read ? 'border-l-4 border-blue-500' : ''
        }`}
    >
        <div className="flex items-start">
            <div className={`${notification.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 flex-shrink-0`}>
                {notification.icon}
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-wide">{notification.title}</h3>
                    {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                    )}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{notification.message}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{notification.time}</p>
            </div>
        </div>
    </div>
);

interface NotificationsScreenProps {
    navigate: (view: string) => void;
    setView: (view: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigate, setView }) => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.read);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white pt-12 pb-6 px-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-500 font-semibold"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            <div className="px-6 py-4">
                {filteredNotifications.length > 0 ? (
                    <div>
                        {filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onClick={() => {
                                    markAsRead(notification.id);
                                    // Navigate based on notification type
                                    if (notification.type === 'appointment') {
                                        navigate('schedule');
                                    } else if (notification.type === 'medication') {
                                        navigate('history/medications');
                                    } else if (notification.type === 'health') {
                                        navigate('history/report');
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔔</div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No notifications</p>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">You're all caught up!</p>
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="fixed bottom-32 right-6">
                    <button
                        onClick={clearAll}
                        className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-red-600 transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

