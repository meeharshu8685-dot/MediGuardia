/**
 * Supabase Storage Helper Functions
 * 
 * Provides functions for uploading and managing files in Supabase Storage
 */

import { supabase } from './supabase';

/**
 * Upload avatar image to Supabase Storage
 * @param file - Image file to upload
 * @returns Public URL of uploaded avatar
 */
export const uploadAvatar = async (
    file: File
): Promise<{ url?: string; path?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'User not authenticated' };
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return { error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)' };
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { error: 'File too large. Maximum size is 5MB' };
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload file
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return { error: uploadError.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            path: filePath
        };
    } catch (error: any) {
        console.error('Error in uploadAvatar:', error);
        return { error: error.message || 'Failed to upload avatar' };
    }
};

/**
 * Upload document to Supabase Storage
 * @param file - Document file to upload
 * @returns File path and signed URL
 */
export const uploadDocument = async (
    file: File
): Promise<{ path?: string; url?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'User not authenticated' };
        }

        // Validate file type
        const validTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            return { error: 'Invalid file type. Please upload a PDF, image, or Word document' };
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { error: 'File too large. Maximum size is 10MB' };
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const filePath = `documents/${fileName}`;

        // Upload file
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading document:', uploadError);
            return { error: uploadError.message };
        }

        // Get signed URL (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signedUrlError) {
            console.error('Error creating signed URL:', signedUrlError);
            return { error: signedUrlError.message };
        }

        return {
            path: filePath,
            url: signedUrlData.signedUrl
        };
    } catch (error: any) {
        console.error('Error in uploadDocument:', error);
        return { error: error.message || 'Failed to upload document' };
    }
};

/**
 * Delete file from Supabase Storage
 * @param bucket - Bucket name ('avatars' or 'documents')
 * @param filePath - Path to file (without bucket prefix)
 */
export const deleteFile = async (
    bucket: 'avatars' | 'documents',
    filePath: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Ensure file path belongs to user
        if (!filePath.includes(user.id)) {
            return { success: false, error: 'Unauthorized: File does not belong to user' };
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteFile:', error);
        return { success: false, error: error.message || 'Failed to delete file' };
    }
};

/**
 * Get public URL for avatar
 * @param filePath - Path to file in avatars bucket
 */
export const getAvatarUrl = (filePath: string): string => {
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
    return data.publicUrl;
};

/**
 * Get signed URL for document (temporary access)
 * @param filePath - Path to file in documents bucket
 * @param expiresIn - Expiry time in seconds (default: 3600 = 1 hour)
 */
export const getDocumentUrl = async (
    filePath: string,
    expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> => {
    try {
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            return { error: error.message };
        }

        return { url: data.signedUrl };
    } catch (error: any) {
        console.error('Error in getDocumentUrl:', error);
        return { error: error.message || 'Failed to get document URL' };
    }
};

/**
 * List user's files in a bucket
 * @param bucket - Bucket name
 * @param folder - Folder path (user ID)
 */
export const listUserFiles = async (
    bucket: 'avatars' | 'documents',
    folder: string
): Promise<{ files?: any[]; error?: string }> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('Error listing files:', error);
            return { error: error.message };
        }

        return { files: data || [] };
    } catch (error: any) {
        console.error('Error in listUserFiles:', error);
        return { error: error.message || 'Failed to list files' };
    }
};

