/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

/**
 * Calculate profile completeness percentage
 */
export const calculateProfileCompleteness = (profile: any): number => {
    const fields = [
        'name',
        'email',
        'age',
        'gender',
        'height',
        'weight',
        'bloodGroup',
        'mobileNumber',
        'emergencyContact.name',
        'emergencyContact.phone',
        'avatarUrl'
    ];

    let completed = 0;
    fields.forEach(field => {
        const keys = field.split('.');
        let value = profile;
        for (const key of keys) {
            value = value?.[key];
        }
        if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
            completed++;
        }
    });

    return Math.round((completed / fields.length) * 100);
};

