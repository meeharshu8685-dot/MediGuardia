import { Hospital } from '../types';

// Mock hospital data - In production, use Google Places API or a hospital database
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

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

/**
 * Get nearby hospitals based on user location
 */
export const getNearbyHospitals = async (
    userLat: number,
    userLon: number,
    radiusKm: number = 10
): Promise<Hospital[]> => {
    try {
        // Calculate distance for each hospital and filter by radius
        const hospitalsWithDistance = mockHospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude)
        }));

        // Filter by radius and sort by distance
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
 * Get nearest hospitals to a specific hospital (for recommendations)
 */
export const getNearestHospitals = (
    hospitalId: string,
    userLat: number,
    userLon: number,
    limit: number = 5
): Hospital[] => {
    try {
        const selectedHospital = mockHospitals.find(h => h.id === hospitalId);
        if (!selectedHospital) return [];

        // Calculate distance from user location for all hospitals
        const hospitalsWithDistance = mockHospitals
            .filter(h => h.id !== hospitalId) // Exclude the selected hospital
            .map(hospital => ({
                ...hospital,
                distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude)
            }));

        // Sort by distance and rating (prioritize closer hospitals with good ratings)
        const nearestHospitals = hospitalsWithDistance
            .sort((a, b) => {
                // Primary sort: distance
                const distanceDiff = (a.distance || 0) - (b.distance || 0);
                if (Math.abs(distanceDiff) < 2) {
                    // If distance is similar (within 2km), sort by rating
                    return (b.rating || 0) - (a.rating || 0);
                }
                return distanceDiff;
            })
            .slice(0, limit);

        return nearestHospitals;
    } catch (error) {
        console.error('Error getting nearest hospitals:', error);
        return [];
    }
};

/**
 * Get all hospitals (for map display)
 */
export const getAllHospitals = (): Hospital[] => {
    return mockHospitals;
};

/**
 * Get hospital by ID
 */
export const getHospitalById = (id: string): Hospital | undefined => {
    return mockHospitals.find(h => h.id === id);
};

/**
 * Search hospitals by name or address
 */
export const searchHospitals = (query: string): Hospital[] => {
    const lowerQuery = query.toLowerCase();
    return mockHospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(lowerQuery) ||
        hospital.address.toLowerCase().includes(lowerQuery)
    );
};

