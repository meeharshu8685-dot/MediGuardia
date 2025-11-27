import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { SOSLog } from '../../types';

/**
 * Create SOS log
 */
export const createSOSLog = async (
    latitude: number,
    longitude: number,
    address?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const sosRef = collection(db, 'sos_logs', user.id, 'logs');
        const docRef = await addDoc(sosRef, {
            userId: user.id,
            latitude,
            longitude,
            address: address || '',
            timestamp: new Date().toISOString(),
            status: 'active',
            emergencyContactNotified: false,
        });

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error creating SOS log:', error);
        return { success: false, error: error.message || 'Failed to create SOS log' };
    }
};

/**
 * Get SOS logs for current user
 */
export const getSOSLogs = async (): Promise<SOSLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const sosRef = collection(db, 'sos_logs', user.id, 'logs');
        const q = query(sosRef, orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as SOSLog[];
    } catch (error) {
        console.error('Error fetching SOS logs:', error);
        return [];
    }
};

/**
 * Generate WhatsApp share link with location
 */
export const generateWhatsAppShareLink = (latitude: number, longitude: number, address?: string): string => {
    const message = `🚨 EMERGENCY SOS 🚨\n\nLocation: ${address || `${latitude}, ${longitude}`}\n\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

/**
 * Generate SMS share link with location
 */
export const generateSMSShareLink = (latitude: number, longitude: number, address?: string, customMessage?: string): string => {
    const message = customMessage || `🚨 EMERGENCY SOS 🚨\n\nLocation: ${address || `${latitude}, ${longitude}`}\n\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
    return `sms:?body=${encodeURIComponent(message)}`;
};

/**
 * Generate Email share link with location
 */
export const generateEmailShareLink = (
    latitude: number, 
    longitude: number, 
    address?: string, 
    customMessage?: string,
    recipientEmail?: string
): string => {
    const subject = encodeURIComponent('🚨 EMERGENCY SOS Alert');
    const body = encodeURIComponent(
        customMessage || 
        `🚨 EMERGENCY SOS 🚨\n\nLocation: ${address || `${latitude}, ${longitude}`}\n\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}\n\nPlease respond immediately.`
    );
    const to = recipientEmail ? `&to=${encodeURIComponent(recipientEmail)}` : '';
    return `mailto:${to}?subject=${subject}&body=${body}`;
};

/**
 * Generate enhanced WhatsApp share link
 */
export const generateEnhancedWhatsAppShareLink = (
    latitude: number, 
    longitude: number, 
    address?: string, 
    customMessage?: string,
    phoneNumber?: string
): string => {
    const message = customMessage || `🚨 EMERGENCY SOS 🚨\n\nLocation: ${address || `${latitude}, ${longitude}`}\n\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
    const phone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    return url;
};

