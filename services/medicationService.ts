import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { Medication } from '../types';

/**
 * Get all medications for current user
 */
export const getMedications = async (): Promise<Medication[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return [];
        }

        const medicationsRef = collection(db, 'medications');
        const q = query(
            medicationsRef,
            where('user_id', '==', user.id),
            orderBy('created_at', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            dosage: doc.data().dosage,
            frequency: doc.data().frequency,
            time: doc.data().time,
        }));
    } catch (error) {
        console.error('Error fetching medications:', error);
        return [];
    }
};

/**
 * Add a new medication
 */
export const addMedication = async (medication: Omit<Medication, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medicationsRef = collection(db, 'medications');
        const docRef = await addDoc(medicationsRef, {
            user_id: user.id,
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            time: medication.time,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error adding medication:', error);
        return { success: false, error: error.message || 'Failed to add medication' };
    }
};

/**
 * Update a medication
 */
export const updateMedication = async (id: string, medication: Partial<Medication>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medicationRef = doc(db, 'medications', id);
        await updateDoc(medicationRef, {
            ...medication,
            updated_at: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error updating medication:', error);
        return { success: false, error: error.message || 'Failed to update medication' };
    }
};

/**
 * Delete a medication
 */
export const deleteMedication = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const medicationRef = doc(db, 'medications', id);
        await deleteDoc(medicationRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting medication:', error);
        return { success: false, error: error.message || 'Failed to delete medication' };
    }
};

