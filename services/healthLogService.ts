import { supabase } from '../lib/supabase';
import { HealthLog } from '../types';

/**
 * Get all health logs for current user from Supabase
 */
export const getHealthLogs = async (): Promise<HealthLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return [];
        }

        const { data, error } = await supabase
            .from('health_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
        
        if (error) {
            console.error('Error fetching health logs:', error);
            return [];
        }

        return (data || []).map(log => ({
            id: log.id,
            date: log.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            symptom: Array.isArray(log.symptoms) ? log.symptoms.join(', ') : (log.symptoms || log.diagnosis || ''),
            severity: log.severity || 'Moderate' as 'Minor' | 'Moderate' | 'Severe',
            details: log.notes || log.details || '',
        }));
    } catch (error) {
        console.error('Error fetching health logs:', error);
        return [];
    }
};

/**
 * Add a new health log to Supabase
 */
export const addHealthLog = async (log: Omit<HealthLog, 'id' | 'date'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('health_logs')
            .insert({
                user_id: user.id,
                symptoms: log.symptom ? [log.symptom] : [],
                severity: log.severity || 'Moderate',
                notes: log.details || null,
                diagnosis: log.symptom || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding health log:', error);
            return { success: false, error: error.message || 'Failed to add health log' };
        }

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Error adding health log:', error);
        return { success: false, error: error.message || 'Failed to add health log' };
    }
};

/**
 * Update a health log in Supabase
 */
export const updateHealthLog = async (id: string, log: Partial<HealthLog>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const updates: any = {};
        if (log.symptom) updates.symptoms = [log.symptom];
        if (log.severity) updates.severity = log.severity;
        if (log.details !== undefined) updates.notes = log.details;

        const { error } = await supabase
            .from('health_logs')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating health log:', error);
            return { success: false, error: error.message || 'Failed to update health log' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating health log:', error);
        return { success: false, error: error.message || 'Failed to update health log' };
    }
};

/**
 * Delete a health log from Supabase
 */
export const deleteHealthLog = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('health_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting health log:', error);
            return { success: false, error: error.message || 'Failed to delete health log' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting health log:', error);
        return { success: false, error: error.message || 'Failed to delete health log' };
    }
};

