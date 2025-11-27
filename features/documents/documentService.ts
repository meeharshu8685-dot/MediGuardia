import { collection, query, getDocs, addDoc, doc, getDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { MedicalDocument } from '../../types';

/**
 * Get all documents for current user
 */
export const getDocuments = async (): Promise<MedicalDocument[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const docsRef = collection(db, 'documents', user.id, 'files');
        const q = query(docsRef, orderBy('uploadDate', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as MedicalDocument[];
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
};

/**
 * Upload document to Firebase Storage and save metadata
 */
export const uploadDocument = async (file: File): Promise<{ success: boolean; document?: MedicalDocument; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Determine file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const fileType = ['pdf'].includes(fileExtension) ? 'pdf' : 
                        ['jpg', 'jpeg', 'png'].includes(fileExtension) ? fileExtension as 'jpg' | 'png' : 'pdf';

        // Upload to Storage
        const fileRef = ref(storage, `documents/${user.id}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);

        // Save metadata to Firestore
        const docsRef = collection(db, 'documents', user.id, 'files');
        const docRef = await addDoc(docsRef, {
            name: file.name,
            type: fileType,
            uploadDate: new Date().toISOString(),
            previewUrl: downloadURL,
            downloadUrl: downloadURL,
            size: file.size,
            userId: user.id,
        });

        const document: MedicalDocument = {
            id: docRef.id,
            name: file.name,
            type: fileType,
            uploadDate: new Date().toISOString(),
            previewUrl: downloadURL,
            downloadUrl: downloadURL,
            size: file.size,
            userId: user.id,
        };

        return { success: true, document };
    } catch (error: any) {
        console.error('Error uploading document:', error);
        return { success: false, error: error.message || 'Failed to upload document' };
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (docId: string, downloadUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Delete from Storage
        try {
            const fileRef = ref(storage, downloadUrl);
            await deleteObject(fileRef);
        } catch (error) {
            console.warn('Error deleting file from storage:', error);
        }

        // Delete metadata from Firestore
        const docRef = doc(db, 'documents', user.id, 'files', docId);
        await deleteDoc(docRef);

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message || 'Failed to delete document' };
    }
};

