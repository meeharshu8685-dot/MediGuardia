import { collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { Feedback } from '../../types';

/**
 * Submit feedback
 */
export const submitFeedback = async (
    message: string,
    rating: number
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const feedbackRef = collection(db, 'feedback', user.id, 'items');
        const docRef = await addDoc(feedbackRef, {
            userId: user.id,
            message,
            rating,
            createdAt: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message || 'Failed to submit feedback' };
    }
};

/**
 * Get feedback for current user
 */
export const getFeedback = async (): Promise<Feedback[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const feedbackRef = collection(db, 'feedback', user.id, 'items');
        const q = query(feedbackRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Feedback[];
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
};

