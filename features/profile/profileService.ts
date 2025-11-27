import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { cache } from '../../lib/utils/cache';

export interface ProfileData {
    full_name?: string;
    mobile_number?: string;
    email?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    height?: string;
    weight?: string;
    blood_group?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    current_medications?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    avatar_url?: string;
}

/**
 * Get user profile from Firestore
 */
export const getProfile = async (): Promise<UserProfile | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Try cache first
        const cached = await cache.getProfile(user.id);
        if (cached && !navigator.onLine) {
            return cached;
        }

        const profileRef = doc(db, 'profiles', user.id);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
            return null;
        }

        const data = profileSnap.data();
        const profile = convertToUserProfile(data, user);
        
        // Cache the profile
        await cache.setProfile(user.id, profile);
        
        return profile;
    } catch (error) {
        console.error('Error fetching profile:', error);
        // Try cache on error
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            return await cache.getProfile(user.id);
        }
        return null;
    }
};

/**
 * Save profile to Firestore
 */
export const saveProfile = async (profileData: ProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const profileRef = doc(db, 'profiles', user.id);
        const payload = {
            user_id: user.id,
            ...profileData,
            updated_at: new Date().toISOString(),
        };

        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
            await updateDoc(profileRef, payload);
        } else {
            await setDoc(profileRef, {
                ...payload,
                created_at: new Date().toISOString(),
            });
        }

        // Update cache
        const updatedProfile = await getProfile();
        if (updatedProfile) {
            await cache.setProfile(user.id, updatedProfile);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error saving profile:', error);
        return { success: false, error: error.message || 'Failed to save profile' };
    }
};

/**
 * Upload profile photo to Firebase Storage
 */
export const uploadProfilePhoto = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Delete old photo if exists
        const profile = await getProfile();
        if (profile?.avatarUrl && profile.avatarUrl.includes('firebasestorage')) {
            try {
                const oldPhotoRef = ref(storage, `profiles/${user.id}/avatar`);
                await deleteObject(oldPhotoRef);
            } catch (error) {
                console.warn('Error deleting old photo:', error);
            }
        }

        // Upload new photo
        const photoRef = ref(storage, `profiles/${user.id}/avatar`);
        await uploadBytes(photoRef, file);
        const downloadURL = await getDownloadURL(photoRef);

        // Update profile with new photo URL
        await saveProfile({ avatar_url: downloadURL });

        return { success: true, url: downloadURL };
    } catch (error: any) {
        console.error('Error uploading photo:', error);
        return { success: false, error: error.message || 'Failed to upload photo' };
    }
};

/**
 * Delete profile photo
 */
export const deleteProfilePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const photoRef = ref(storage, `profiles/${user.id}/avatar`);
        await deleteObject(photoRef);
        
        // Update profile to remove photo URL
        await saveProfile({ avatar_url: '' });

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting photo:', error);
        return { success: false, error: error.message || 'Failed to delete photo' };
    }
};

/**
 * Convert Firestore data to UserProfile
 */
const convertToUserProfile = (data: any, user: any): UserProfile => {
    return {
        name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: data.email || user.email || '',
        avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`,
        age: data.age || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        bloodGroup: data.blood_group || undefined,
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        currentMedications: data.current_medications || undefined,
        mobileNumber: data.mobile_number || undefined,
        gender: data.gender || undefined,
        emergencyContact: {
            name: data.emergency_contact_name || '',
            phone: data.emergency_contact_phone || ''
        }
    };
};

