import { Hospital } from '../../types';
import { supabase } from '../../lib/supabase';
import { calculateDistance } from '../../lib/utils/distance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get nearby hospitals (within 5km radius)
 * Uses backend API if available, otherwise falls back to mock data
 */
export const getNearbyHospitals = async (
    userLat: number,
    userLon: number,
    radiusKm: number = 5
): Promise<Hospital[]> => {
    try {
        // Try backend API first
        const shouldUseBackend = API_BASE_URL && 
                                 API_BASE_URL !== 'http://localhost:3001' && 
                                 API_BASE_URL.startsWith('http');
        
        if (shouldUseBackend) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    const radiusMeters = radiusKm * 1000;
                    const response = await fetch(
                        `${API_BASE_URL}/api/hospitals?lat=${userLat}&lng=${userLon}&radius=${radiusMeters}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (response.ok) {
                        const backendHospitals = await response.json();
                        return backendHospitals.map((h: any) => ({
                            id: `${h.lat}-${h.lng}`,
                            name: h.name,
                            address: h.address,
                            latitude: h.lat,
                            longitude: h.lng,
                            distance: h.distance_km,
                            specialties: extractSpecialties(h.fields || []),
                            emergencyServices: h.fields?.includes('Emergency') || false,
                            phone: '',
                            google_maps_url: `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
                        }));
                    }
                }
            } catch (apiError) {
                console.warn('Backend API unavailable, using fallback:', apiError);
            }
        }

        // Fallback to mock data
        const mockHospitals: Hospital[] = [
            {
                id: '1',
                name: 'City General Hospital',
                address: '123 Main Street, Downtown',
                phone: '+1-555-0101',
                latitude: 40.7128,
                longitude: -74.0060,
                openHours: '24 Hours',
                emergencyServices: true,
                specialties: ['Emergency', 'Cardiology', 'Surgery'],
                rating: 4.5,
                reviewCount: 1247
            },
            {
                id: '2',
                name: 'Oak Valley Medical Center',
                address: '456 Oak Avenue, Suburbia',
                phone: '+1-555-0102',
                latitude: 40.7580,
                longitude: -73.9855,
                openHours: '6:00 AM - 10:00 PM',
                emergencyServices: true,
                specialties: ['Emergency', 'Pediatrics', 'Orthopedics'],
                rating: 4.8,
                reviewCount: 892
            },
            {
                id: '3',
                name: 'Riverside Clinic',
                address: '789 River Road, Riverside',
                phone: '+1-555-0103',
                latitude: 40.7282,
                longitude: -74.0776,
                openHours: '8:00 AM - 6:00 PM',
                emergencyServices: false,
                specialties: ['General Practice', 'Dermatology'],
                rating: 4.2,
                reviewCount: 456
            },
            {
                id: '4',
                name: 'Metro Emergency Hospital',
                address: '321 Metro Boulevard, City Center',
                phone: '+1-555-0104',
                latitude: 40.7505,
                longitude: -73.9934,
                openHours: '24 Hours',
                emergencyServices: true,
                specialties: ['Emergency', 'Trauma', 'ICU'],
                rating: 4.7,
                reviewCount: 1834
            },
            {
                id: '5',
                name: 'Community Health Center',
                address: '654 Community Lane, Westside',
                phone: '+1-555-0105',
                latitude: 40.7489,
                longitude: -74.0040,
                openHours: '7:00 AM - 9:00 PM',
                emergencyServices: true,
                specialties: ['Emergency', 'Family Medicine'],
                rating: 4.3,
                reviewCount: 623
            }
        ];

        const hospitalsWithDistance = mockHospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
            google_maps_url: `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
        }));

        const nearbyHospitals = hospitalsWithDistance
            .filter(h => h.distance <= radiusKm)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        return nearbyHospitals;
    } catch (error) {
        console.error('Error getting nearby hospitals:', error);
        return [];
    }
};

/**
 * Extract specialties from fields (AI keyword extraction simulation)
 */
const extractSpecialties = (fields: string[]): string[] => {
    const specialtyKeywords: { [key: string]: string[] } = {
        'Emergency': ['emergency', 'er', 'trauma'],
        'Cardiology': ['cardiac', 'heart', 'cardiovascular'],
        'Surgery': ['surgical', 'operation'],
        'Pediatrics': ['pediatric', 'children', 'child'],
        'Orthopedics': ['orthopedic', 'bone', 'joint'],
        'Dermatology': ['skin', 'dermatology'],
        'General Practice': ['general', 'family', 'primary'],
        'ICU': ['intensive', 'critical', 'icu'],
    };

    const specialties: string[] = [];
    const lowerFields = fields.map(f => f.toLowerCase());

    Object.entries(specialtyKeywords).forEach(([specialty, keywords]) => {
        if (keywords.some(keyword => lowerFields.some(field => field.includes(keyword)))) {
            specialties.push(specialty);
        }
    });

    return specialties.length > 0 ? specialties : ['General Practice'];
};

/**
 * Open Google Maps directions
 */
export const openGoogleMapsDirections = (latitude: number, longitude: number): void => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
};

