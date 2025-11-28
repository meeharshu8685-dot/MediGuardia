import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export interface MedicalProfileData {
    full_name?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    chronic_conditions?: string[];
    existing_medications?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    height?: string;
    weight?: string;
    avatar_url?: string;
}

/**
 * Get medical profile for current user from Supabase
 */
export const getMedicalProfile = async (): Promise<UserProfile | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return null;
        }

        // Fetch from Supabase database
        const { data, error } = await supabase
            .from('medical_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found - return null
                return null;
            }
            console.error('Error fetching medical profile:', error);
            return null;
        }

        return convertToUserProfile(data, user);
    } catch (error) {
        console.error('Error fetching medical profile:', error);
        return null;
    }
};

/**
 * Create or update medical profile in Supabase
 */
export const saveMedicalProfile = async (profileData: MedicalProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Prepare emergency contact as JSONB
        const emergencyContact = profileData.emergency_contact_name || profileData.emergency_contact_phone
            ? {
                name: profileData.emergency_contact_name || '',
                phone: profileData.emergency_contact_phone || ''
            }
            : null;

        // Get existing profile to preserve height and weight if not provided in update
        let existingHeight = null;
        let existingWeight = null;
        
        // Check if we need to preserve existing values
        const needToPreserveHeight = !profileData.height || profileData.height === '';
        const needToPreserveWeight = !profileData.weight || profileData.weight === '';
        
        if (needToPreserveHeight || needToPreserveWeight) {
            // Fetch current profile to preserve existing values
            const { data: existing, error: fetchError } = await supabase
                .from('medical_profiles')
                .select('height, weight')
                .eq('user_id', user.id)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 means no rows found, which is fine for new profiles
                console.warn('Error fetching existing profile:', fetchError);
            }
            
            if (existing) {
                if (needToPreserveHeight) {
                    existingHeight = existing.height;
                }
                if (needToPreserveWeight) {
                    existingWeight = existing.weight;
                }
            }
        }
        
        const profilePayload: any = {
            user_id: user.id,
            name: profileData.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            age: profileData.age || null,
            gender: profileData.gender || null,
            blood_group: profileData.blood_group || null,
            allergies: profileData.allergies || [],
            chronic_conditions: profileData.chronic_conditions || [],
            emergency_contact: emergencyContact,
            avatar_url: profileData.avatar_url || null,
            updated_at: new Date().toISOString(),
        };
        
        // Handle height: use new value if provided, otherwise preserve existing, or set to null
        if (profileData.height && profileData.height !== '') {
            profilePayload.height = profileData.height;
        } else if (existingHeight !== null) {
            profilePayload.height = existingHeight;
        } else {
            profilePayload.height = null;
        }
        
        // Handle weight: use new value if provided, otherwise preserve existing, or set to null
        if (profileData.weight && profileData.weight !== '') {
            profilePayload.weight = profileData.weight;
        } else if (existingWeight !== null) {
            profilePayload.weight = existingWeight;
        } else {
            profilePayload.weight = null;
        }

        // Use upsert to create or update
        const { error, data } = await supabase
            .from('medical_profiles')
            .upsert(profilePayload, {
                onConflict: 'user_id'
            })
            .select();

        if (error) {
            console.error('Error saving medical profile:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return { 
                success: false, 
                error: error.message || error.details || 'Failed to save profile. Please check your database connection.' 
            };
        }

        console.log('Profile saved successfully:', data);
        return { success: true };
    } catch (error: any) {
        console.error('Error saving medical profile:', error);
        return { 
            success: false, 
            error: error.message || 'An unexpected error occurred while saving your profile.' 
        };
    }
};

/**
 * Convert Supabase data to UserProfile format
 */
const convertToUserProfile = (data: any, user: any): UserProfile => {
    // Handle emergency contact (can be JSONB object or separate fields)
    let emergencyContact = { name: '', phone: '' };
    if (data.emergency_contact) {
        if (typeof data.emergency_contact === 'object') {
            emergencyContact = {
                name: data.emergency_contact.name || '',
                phone: data.emergency_contact.phone || ''
            };
        }
    } else if (data.emergency_contact_name || data.emergency_contact_phone) {
        // Fallback for old format
        emergencyContact = {
            name: data.emergency_contact_name || '',
            phone: data.emergency_contact_phone || ''
        };
    }

    return {
        name: data.name || data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://i.pravatar.cc/150?u=${user.email}`,
        age: data.age || undefined,
        gender: data.gender || undefined,
        bloodGroup: data.blood_group || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        emergencyContact
    };
};

/**
 * Delete medical profile from Supabase
 */
export const deleteMedicalProfile = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('medical_profiles')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting medical profile:', error);
            return { success: false, error: error.message || 'Failed to delete profile' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting medical profile:', error);
        return { success: false, error: error.message || 'Failed to delete profile' };
    }
};
