import { supabase } from '../../lib/supabase';
import { SOSLog } from '../../types';

/**
 * Create SOS log in Supabase
 */
export const createSOSLog = async (
    latitude: number,
    longitude: number,
    address?: string,
    emergencyCategory?: string,
    emergencyMessage?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('sos_logs')
            .insert({
                user_id: user.id,
                latitude,
                longitude,
                address: address || null,
                emergency_category: emergencyCategory || null,
                emergency_message: emergencyMessage || null,
                status: 'active',
                emergency_contact_notified: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating SOS log:', error);
            return { success: false, error: error.message || 'Failed to create SOS log' };
        }

        return { success: true, id: data.id };
    } catch (error: any) {
        console.error('Error creating SOS log:', error);
        return { success: false, error: error.message || 'Failed to create SOS log' };
    }
};

/**
 * Get SOS logs for current user from Supabase
 */
export const getSOSLogs = async (): Promise<SOSLog[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('sos_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching SOS logs:', error);
            return [];
        }

        // Map Supabase column names to SOSLog type
        return (data || []).map(log => ({
            id: log.id,
            userId: log.user_id,
            latitude: log.latitude,
            longitude: log.longitude,
            address: log.address,
            emergencyCategory: log.emergency_category,
            emergencyMessage: log.emergency_message,
            timestamp: log.timestamp,
            status: log.status,
            emergencyContactNotified: log.emergency_contact_notified,
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

