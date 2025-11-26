import { Location } from '../types';

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error(`Location error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

/**
 * Reverse geocode coordinates to address (using a free service)
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        // Using OpenStreetMap Nominatim API (free, no key required)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'MediGuardia/1.0'
                }
            }
        );

        const data = await response.json();
        
        if (data.address) {
            const address = data.address;
            const parts = [];
            
            if (address.road) parts.push(address.road);
            if (address.house_number) parts.push(address.house_number);
            if (address.city || address.town || address.village) {
                parts.push(address.city || address.town || address.village);
            }
            if (address.state) parts.push(address.state);
            if (address.postcode) parts.push(address.postcode);
            
            return parts.length > 0 ? parts.join(', ') : data.display_name || 'Address not available';
        }
        
        return data.display_name || 'Address not available';
    } catch (error) {
        console.error('Error getting address:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
};

/**
 * Format location for sharing
 */
export const formatLocationForSharing = (location: Location, address?: string): string => {
    const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    const locationText = address || coords;
    return `Emergency Location:\n${locationText}\n\nCoordinates: ${coords}\n\nGoogle Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
};

/**
 * Share location via WhatsApp
 */
export const shareViaWhatsApp = (location: Location, address?: string) => {
    const message = formatLocationForSharing(location, address);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
};

/**
 * Share location via SMS
 */
export const shareViaSMS = (location: Location, phoneNumber: string, address?: string) => {
    const message = formatLocationForSharing(location, address);
    const encodedMessage = encodeURIComponent(message);
    window.open(`sms:${phoneNumber}?body=${encodedMessage}`, '_blank');
};

/**
 * Copy location to clipboard
 */
export const copyLocationToClipboard = async (location: Location, address?: string): Promise<boolean> => {
    try {
        const text = formatLocationForSharing(location, address);
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
};

