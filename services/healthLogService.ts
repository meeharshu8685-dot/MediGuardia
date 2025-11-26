import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { HealthLog } from '../types';

/**
 * Get all health logs for current user
 */
export const getHealthLogs = async (): Promise<HealthLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return [];
        }

        const logsRef = collection(db, 'health_logs');
        const q = query(
            logsRef,
            where('user_id', '==', user.id),
            orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            date: doc.data().date,
            symptom: doc.data().symptom,
            severity: doc.data().severity as 'Minor' | 'Moderate' | 'Severe',
            details: doc.data().details || '',
        }));
    } catch (error) {
        console.error('Error fetching health logs:', error);
        return [];
    }
};

/**
 * Add a new health log
 */
export const addHealthLog = async (log: Omit<HealthLog, 'id' | 'date'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logsRef = collection(db, 'health_logs');
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        const docRef = await addDoc(logsRef, {
            user_id: user.id,
            date: date,
            symptom: log.symptom,
            severity: log.severity,
            details: log.details || '',
            created_at: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error adding health log:', error);
        return { success: false, error: error.message || 'Failed to add health log' };
    }
};

/**
 * Update a health log
 */
export const updateHealthLog = async (id: string, log: Partial<HealthLog>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logRef = doc(db, 'health_logs', id);
        await updateDoc(logRef, {
            ...log,
            updated_at: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error updating health log:', error);
        return { success: false, error: error.message || 'Failed to update health log' };
    }
};

/**
 * Delete a health log
 */
export const deleteHealthLog = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const logRef = doc(db, 'health_logs', id);
        await deleteDoc(logRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting health log:', error);
        return { success: false, error: error.message || 'Failed to delete health log' };
    }
};

