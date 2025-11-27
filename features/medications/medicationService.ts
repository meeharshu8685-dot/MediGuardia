import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { Medication } from '../../types';

/**
 * Get all medications for current user
 */
export const getMedications = async (): Promise<Medication[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const medsRef = collection(db, 'medications', user.id, 'items');
        const q = query(medsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Medication[];
    } catch (error) {
        console.error('Error fetching medications:', error);
        return [];
    }
};

/**
 * Add new medication
 */
export const addMedication = async (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medsRef = collection(db, 'medications', user.id, 'items');
        const docRef = await addDoc(medsRef, {
            ...med,
            reminderEnabled: med.reminderEnabled || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error adding medication:', error);
        return { success: false, error: error.message || 'Failed to add medication' };
    }
};

/**
 * Update medication
 */
export const updateMedication = async (medId: string, updates: Partial<Medication>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medRef = doc(db, 'medications', user.id, 'items', medId);
        await updateDoc(medRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error updating medication:', error);
        return { success: false, error: error.message || 'Failed to update medication' };
    }
};

/**
 * Delete medication
 */
export const deleteMedication = async (medId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medRef = doc(db, 'medications', user.id, 'items', medId);
        await deleteDoc(medRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting medication:', error);
        return { success: false, error: error.message || 'Failed to delete medication' };
    }
};

