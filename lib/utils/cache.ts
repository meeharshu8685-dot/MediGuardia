import localforage from 'localforage';

// Configure localForage
localforage.config({
    name: 'MediGuardia',
    storeName: 'mediguardia_cache',
    description: 'MediGuardia offline cache'
});

export const cache = {
    // Profile cache
    async getProfile(userId: string): Promise<any | null> {
        try {
            return await localforage.getItem(`profile_${userId}`);
        } catch (error) {
            console.error('Error getting profile from cache:', error);
            return null;
        }
    },

    async setProfile(userId: string, profile: any): Promise<void> {
        try {
            await localforage.setItem(`profile_${userId}`, profile);
        } catch (error) {
            console.error('Error caching profile:', error);
        }
    },

    // Quotes cache
    async getQuotes(): Promise<any[] | null> {
        try {
            return await localforage.getItem('quotes');
        } catch (error) {
            console.error('Error getting quotes from cache:', error);
            return null;
        }
    },

    async setQuotes(quotes: any[]): Promise<void> {
        try {
            await localforage.setItem('quotes', quotes);
        } catch (error) {
            console.error('Error caching quotes:', error);
        }
    },

    // First Aid cache
    async getFirstAid(): Promise<any | null> {
        try {
            return await localforage.getItem('firstaid');
        } catch (error) {
            console.error('Error getting first aid from cache:', error);
            return null;
        }
    },

    async setFirstAid(data: any): Promise<void> {
        try {
            await localforage.setItem('firstaid', data);
        } catch (error) {
            console.error('Error caching first aid:', error);
        }
    },

    // Clear all cache
    async clearAll(): Promise<void> {
        try {
            await localforage.clear();
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },

    // Clear specific user cache
    async clearUserCache(userId: string): Promise<void> {
        try {
            await localforage.removeItem(`profile_${userId}`);
        } catch (error) {
            console.error('Error clearing user cache:', error);
        }
    }
};

// Check if online
export const isOnline = (): boolean => {
    return navigator.onLine;
};

// Network status listener
export const onNetworkStatusChange = (callback: (isOnline: boolean) => void) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
};

