import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { HealthLog } from '../../types';

/**
 * Get all health logs for current user
 */
export const getHealthLogs = async (): Promise<HealthLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const logsRef = collection(db, 'history', user.id, 'entries');
        const q = query(logsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as HealthLog[];
    } catch (error) {
        console.error('Error fetching health logs:', error);
        return [];
    }
};

/**
 * Get single health log by ID
 */
export const getHealthLog = async (logId: string): Promise<HealthLog | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const logRef = doc(db, 'history', user.id, 'entries', logId);
        const logSnap = await getDoc(logRef);

        if (!logSnap.exists()) {
            return null;
        }

        return {
            id: logSnap.id,
            ...logSnap.data(),
        } as HealthLog;
    } catch (error) {
        console.error('Error fetching health log:', error);
        return null;
    }
};

/**
 * Add new health log
 */
export const addHealthLog = async (log: Omit<HealthLog, 'id' | 'timestamp'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logsRef = collection(db, 'history', user.id, 'entries');
        const docRef = await addDoc(logsRef, {
            ...log,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error adding health log:', error);
        return { success: false, error: error.message || 'Failed to add health log' };
    }
};

/**
 * Update health log
 */
export const updateHealthLog = async (logId: string, updates: Partial<HealthLog>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logRef = doc(db, 'history', user.id, 'entries', logId);
        await updateDoc(logRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error updating health log:', error);
        return { success: false, error: error.message || 'Failed to update health log' };
    }
};

/**
 * Delete health log
 */
export const deleteHealthLog = async (logId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logRef = doc(db, 'history', user.id, 'entries', logId);
        await deleteDoc(logRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting health log:', error);
        return { success: false, error: error.message || 'Failed to delete health log' };
    }
};

