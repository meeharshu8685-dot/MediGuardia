import { supabase } from '../../lib/supabase';
import { uploadDocument as uploadToStorage, deleteFile, getDocumentUrl } from '../../lib/supabaseStorage';
import { MedicalDocument } from '../../types';

/**
 * Get all documents for current user
 */
export const getDocuments = async (): Promise<MedicalDocument[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }

        if (!data) return [];

        // Convert Supabase data to MedicalDocument format
        const documents: MedicalDocument[] = await Promise.all(
            data.map(async (doc) => {
                // Get signed URL for preview
                const { url: previewUrl } = await getDocumentUrl(doc.file_url, 3600);
                
                return {
                    id: doc.id,
                    name: doc.name,
                    type: doc.type as 'pdf' | 'jpg' | 'png' | 'jpeg',
                    uploadDate: new Date(doc.uploaded_at).toISOString().split('T')[0],
                    previewUrl: previewUrl || doc.file_url,
                    downloadUrl: previewUrl || doc.file_url,
                    size: doc.file_size || undefined,
                    userId: doc.user_id,
                };
            })
        );

        return documents;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
};

/**
 * Upload document to Supabase Storage and save metadata
 */
export const uploadDocument = async (file: File): Promise<{ success: boolean; document?: MedicalDocument; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Validate file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const validTypes = ['pdf', 'jpg', 'jpeg', 'png'];
        if (!validTypes.includes(fileExtension)) {
            return { success: false, error: 'Invalid file type. Please upload a PDF or image (JPG, PNG)' };
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { success: false, error: 'File too large. Maximum size is 10MB' };
        }

        // Determine file type
        const fileType = fileExtension === 'pdf' ? 'pdf' : 
                        ['jpg', 'jpeg'].includes(fileExtension) ? 'jpg' as 'jpg' : 
                        fileExtension === 'png' ? 'png' as 'png' : 'pdf';

        // Upload to Supabase Storage
        const uploadResult = await uploadToStorage(file);
        if (uploadResult.error || !uploadResult.path) {
            return { success: false, error: uploadResult.error || 'Failed to upload file' };
        }

        // Get signed URL for preview
        const { url: previewUrl } = await getDocumentUrl(uploadResult.path, 3600);
        if (!previewUrl) {
            return { success: false, error: 'Failed to generate preview URL' };
        }

        // Save metadata to Supabase database
        const { data: docData, error: dbError } = await supabase
            .from('documents')
            .insert({
                user_id: user.id,
                name: file.name,
                type: fileType,
                file_url: uploadResult.path,
                file_size: file.size,
            })
            .select()
            .single();

        if (dbError || !docData) {
            // If database insert fails, try to delete the uploaded file
            await deleteFile('documents', uploadResult.path);
            return { success: false, error: dbError?.message || 'Failed to save document metadata' };
        }

        const document: MedicalDocument = {
            id: docData.id,
            name: docData.name,
            type: docData.type as 'pdf' | 'jpg' | 'png' | 'jpeg',
            uploadDate: new Date(docData.uploaded_at).toISOString().split('T')[0],
            previewUrl: previewUrl,
            downloadUrl: previewUrl,
            size: docData.file_size || undefined,
            userId: docData.user_id,
        };

        return { success: true, document };
    } catch (error: any) {
        console.error('Error uploading document:', error);
        return { success: false, error: error.message || 'Failed to upload document' };
    }
};

/**
 * Delete document from Supabase
 */
export const deleteDocument = async (docId: string, fileUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Extract file path from URL or use it directly if it's already a path
        let filePath = fileUrl;
        if (fileUrl.includes('/storage/v1/object/public/documents/')) {
            // Extract path from public URL
            filePath = fileUrl.split('/documents/')[1];
        } else if (fileUrl.includes('/storage/v1/object/sign/documents/')) {
            // Extract path from signed URL
            filePath = fileUrl.split('/documents/')[1].split('?')[0];
        }

        // Delete from database first
        const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', docId)
            .eq('user_id', user.id); // Ensure user owns the document

        if (dbError) {
            console.error('Error deleting document from database:', dbError);
            return { success: false, error: dbError.message || 'Failed to delete document' };
        }

        // Delete from storage
        const deleteResult = await deleteFile('documents', filePath);
        if (!deleteResult.success) {
            console.warn('Error deleting file from storage:', deleteResult.error);
            // Don't fail if storage delete fails - metadata is already deleted
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message || 'Failed to delete document' };
    }
};

