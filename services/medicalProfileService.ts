import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
 * Get medical profile for current user
 */
export const getMedicalProfile = async (): Promise<UserProfile | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return null;
        }

        const profileRef = doc(db, 'medical_profiles', user.id);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
            return null;
        }

        const data = profileSnap.data();
        return convertToUserProfile(data, user);
    } catch (error) {
        console.error('Error fetching medical profile:', error);
        return null;
    }
};

/**
 * Create or update medical profile
 */
export const saveMedicalProfile = async (profileData: MedicalProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const profileRef = doc(db, 'medical_profiles', user.id);
        
        const profilePayload = {
            user_id: user.id,
            full_name: profileData.full_name || '',
            age: profileData.age || null,
            gender: profileData.gender || null,
            blood_group: profileData.blood_group || null,
            allergies: profileData.allergies || [],
            chronic_conditions: profileData.chronic_conditions || [],
            existing_medications: profileData.existing_medications || [],
            emergency_contact_name: profileData.emergency_contact_name || '',
            emergency_contact_phone: profileData.emergency_contact_phone || '',
            height: profileData.height || '',
            weight: profileData.weight || '',
            avatar_url: profileData.avatar_url || '',
            updated_at: new Date().toISOString(),
        };

        // Check if profile exists
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
            // Update existing profile
            await updateDoc(profileRef, profilePayload);
        } else {
            // Create new profile
            await setDoc(profileRef, {
                ...profilePayload,
                created_at: new Date().toISOString(),
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error saving medical profile:', error);
        return { success: false, error: error.message || 'Failed to save profile' };
    }
};

/**
 * Convert Firestore data to UserProfile format
 */
const convertToUserProfile = (data: any, user: any): UserProfile => {
    return {
        name: data.full_name || user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: data.avatar_url || user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
        age: data.age || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        bloodGroup: data.blood_group || undefined,
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        emergencyContact: {
            name: data.emergency_contact_name || '',
            phone: data.emergency_contact_phone || ''
        }
    };
};

/**
 * Delete medical profile
 */
export const deleteMedicalProfile = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const profileRef = doc(db, 'medical_profiles', user.id);
        await deleteDoc(profileRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting medical profile:', error);
        return { success: false, error: error.message || 'Failed to delete profile' };
    }
};
