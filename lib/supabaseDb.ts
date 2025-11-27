/**
 * Supabase Database Helper
 * 
 * This file provides helper functions for common database operations
 * using Supabase PostgreSQL instead of Firebase Firestore.
 */

import { supabase } from './supabase';

/**
 * Generic function to get all records for the current user
 */
export const getUserRecords = async <T>(
    tableName: string,
    orderBy: string = 'created_at',
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
): Promise<T[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from(tableName)
            .select('*')
            .eq('user_id', user.id)
            .order(orderBy, { ascending: orderDirection === 'asc' });

        if (limitCount) {
            query = query.limit(limitCount);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            return [];
        }

        return data as T[];
    } catch (error) {
        console.error(`Error in getUserRecords for ${tableName}:`, error);
        return [];
    }
};

/**
 * Generic function to create a record
 */
export const createRecord = async <T>(
    tableName: string,
    record: Partial<T>
): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Add user_id to record
        const recordWithUserId = {
            ...record,
            user_id: user.id,
        };

        const { data, error } = await supabase
            .from(tableName)
            .insert(recordWithUserId)
            .select()
            .single();

        if (error) {
            console.error(`Error creating ${tableName}:`, error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as T };
    } catch (error: any) {
        console.error(`Error in createRecord for ${tableName}:`, error);
        return { success: false, error: error.message || 'Failed to create record' };
    }
};

/**
 * Generic function to update a record
 */
export const updateRecord = async <T>(
    tableName: string,
    id: string,
    updates: Partial<T>
): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from(tableName)
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the record
            .select()
            .single();

        if (error) {
            console.error(`Error updating ${tableName}:`, error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as T };
    } catch (error: any) {
        console.error(`Error in updateRecord for ${tableName}:`, error);
        return { success: false, error: error.message || 'Failed to update record' };
    }
};

/**
 * Generic function to delete a record
 */
export const deleteRecord = async (
    tableName: string,
    id: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns the record

        if (error) {
            console.error(`Error deleting ${tableName}:`, error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error(`Error in deleteRecord for ${tableName}:`, error);
        return { success: false, error: error.message || 'Failed to delete record' };
    }
};

/**
 * Get a single record by ID
 */
export const getRecordById = async <T>(
    tableName: string,
    id: string
): Promise<T | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error(`Error fetching ${tableName} by id:`, error);
            return null;
        }

        return data as T;
    } catch (error) {
        console.error(`Error in getRecordById for ${tableName}:`, error);
        return null;
    }
};

/**
 * Get user's medical profile (special case - one per user)
 */
export const getUserMedicalProfile = async <T>(): Promise<T | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('medical_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found
                return null;
            }
            console.error('Error fetching medical profile:', error);
            return null;
        }

        return data as T;
    } catch (error) {
        console.error('Error in getUserMedicalProfile:', error);
        return null;
    }
};

/**
 * Upsert (insert or update) medical profile
 */
export const upsertMedicalProfile = async <T>(
    profile: Partial<T>
): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const profileWithUserId = {
            ...profile,
            user_id: user.id,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('medical_profiles')
            .upsert(profileWithUserId, {
                onConflict: 'user_id',
            })
            .select()
            .single();

        if (error) {
            console.error('Error upserting medical profile:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as T };
    } catch (error: any) {
        console.error('Error in upsertMedicalProfile:', error);
        return { success: false, error: error.message || 'Failed to save profile' };
    }
};

