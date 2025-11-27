import { supabase } from '../lib/supabase';
import { Medication } from '../types';

/**
 * Get all medications for current user from Supabase
 */
export const getMedications = async (): Promise<Medication[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return [];
        }

        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching medications:', error);
            return [];
        }

        return (data || []).map(med => ({
            id: med.id,
            name: med.name,
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            time: med.notes || '', // Notes field stores time
        }));
    } catch (error) {
        console.error('Error fetching medications:', error);
        return [];
    }
};

/**
 * Add a new medication to Supabase
 */
export const addMedication = async (medication: Omit<Medication, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('medications')
            .insert({
                user_id: user.id,
                name: medication.name,
                dosage: medication.dosage || null,
                frequency: medication.frequency || null,
                notes: medication.time || null, // Store time in notes field
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding medication:', error);
            return { success: false, error: error.message || 'Failed to add medication' };
        }

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Error adding medication:', error);
        return { success: false, error: error.message || 'Failed to add medication' };
    }
};

/**
 * Update a medication in Supabase
 */
export const updateMedication = async (id: string, medication: Partial<Medication>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const updates: any = {
            updated_at: new Date().toISOString(),
        };

        if (medication.name) updates.name = medication.name;
        if (medication.dosage !== undefined) updates.dosage = medication.dosage;
        if (medication.frequency !== undefined) updates.frequency = medication.frequency;
        if (medication.time !== undefined) updates.notes = medication.time;

        const { error } = await supabase
            .from('medications')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating medication:', error);
            return { success: false, error: error.message || 'Failed to update medication' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating medication:', error);
        return { success: false, error: error.message || 'Failed to update medication' };
    }
};

/**
 * Delete a medication from Supabase
 */
export const deleteMedication = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting medication:', error);
            return { success: false, error: error.message || 'Failed to delete medication' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting medication:', error);
        return { success: false, error: error.message || 'Failed to delete medication' };
    }
};

