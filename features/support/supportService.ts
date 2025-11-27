import { collection, addDoc, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { SupportRequest } from '../../types';

/**
 * Submit support request
 */
export const submitSupportRequest = async (
    subject: string,
    message: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const supportRef = collection(db, 'support_requests', user.id, 'requests');
        const docRef = await addDoc(supportRef, {
            userId: user.id,
            subject,
            message,
            status: 'open',
            createdAt: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error submitting support request:', error);
        return { success: false, error: error.message || 'Failed to submit support request' };
    }
};

/**
 * Get support requests for current user
 */
export const getSupportRequests = async (): Promise<SupportRequest[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const supportRef = collection(db, 'support_requests', user.id, 'requests');
        const q = query(supportRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as SupportRequest[];
    } catch (error) {
        console.error('Error fetching support requests:', error);
        return [];
    }
};

