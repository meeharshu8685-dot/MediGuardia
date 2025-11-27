import { collection, query, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Quote } from '../../types';
import { cache } from '../../lib/utils/cache';

/**
 * Get quotes from Firestore (with offline caching)
 */
export const getQuotes = async (): Promise<Quote[]> => {
    try {
        // Try cache first
        const cached = await cache.getQuotes();
        if (cached && !navigator.onLine) {
            return cached;
        }

        const quotesRef = collection(db, 'quotes');
        const q = query(quotesRef, orderBy('createdAt', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);

        const quotes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Quote[];

        // Cache quotes
        await cache.setQuotes(quotes);

        return quotes;
    } catch (error) {
        console.error('Error fetching quotes:', error);
        // Try cache on error
        const cached = await cache.getQuotes();
        return cached || [];
    }
};

/**
 * Get random quote
 */
export const getRandomQuote = async (): Promise<Quote | null> => {
    try {
        const quotes = await getQuotes();
        if (quotes.length === 0) {
            // Return default quote if none available
            return {
                id: 'default',
                text: 'Your health is an investment, not an expense.',
                author: 'Unknown',
            };
        }
        return quotes[Math.floor(Math.random() * quotes.length)];
    } catch (error) {
        console.error('Error getting random quote:', error);
        return {
            id: 'default',
            text: 'Your health is an investment, not an expense.',
            author: 'Unknown',
        };
    }
};

