# Frontend Integration Guide

This guide explains how to integrate the Hospital Finder backend API with your React frontend.

## 1. Update Frontend Service

Create or update `services/hospitalService.ts`:

```typescript
import { Hospital } from '../types';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get nearby hospitals from backend API
 */
export const getNearbyHospitals = async (
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<Hospital[]> => {
  try {
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/hospitals?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
    }

    const hospitals = await response.json();
    return hospitals;
  } catch (error: any) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};
```

## 2. Update Environment Variables

Add to your `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

For production:
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

## 3. Update Hospital Locator Screen

Update `screens/HospitalLocatorMapScreen.tsx` to use the backend API:

```typescript
import { getNearbyHospitals } from '../services/hospitalService';

// In your component:
useEffect(() => {
  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      const userPos = { lat: location.latitude, lng: location.longitude };
      
      setUserLocation(userPos);
      setMapCenter(userPos);
      
      // Use backend API instead of mock data
      const hospitals = await getNearbyHospitals(
        location.latitude,
        location.longitude,
        15000 // 15km radius
      );
      
      setHospitals(hospitals);
    } catch (err: any) {
      console.error('Error loading hospitals:', err);
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  };

  loadHospitals();
}, []);
```

## 4. Update Types

Update `types.ts` to match backend response:

```typescript
export interface Hospital {
  id?: string; // Optional, not from backend
  name: string;
  distance_km: number;
  address: string;
  lat: number;
  lng: number;
  fields: string[];
  google_maps_url: string;
  // Optional fields for compatibility
  phone?: string;
  openHours?: string;
  emergencyServices?: boolean;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
}
```

## 5. Update Hospital List Display

The backend returns hospitals in the exact format needed. Update your list component:

```typescript
{hospitals.map((hospital) => (
  <div
    key={`${hospital.lat}-${hospital.lng}`}
    onClick={() => handleHospitalClick(hospital)}
    className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
          {hospital.name}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
          {hospital.address}
        </p>
        <p className="text-sm font-semibold text-primary">
          {hospital.distance_km} km away
        </p>
        {/* Display fields/specialties */}
        <div className="flex flex-wrap gap-1 mt-2">
          {hospital.fields.map((field, idx) => (
            <span
              key={idx}
              className="text-xs bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-light px-2 py-0.5 rounded-full"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
      <a
        href={hospital.google_maps_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
      >
        Go There
      </a>
    </div>
  </div>
))}
```

## 6. Remove Map Dependency (Optional)

Since we're only showing a list, you can remove the Google Maps dependency:

```typescript
// Remove this import
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Replace map section with simple list view
<div className="p-4">
  <h2 className="text-xl font-bold mb-4">Nearby Hospitals</h2>
  {/* Hospital list */}
</div>
```

## 7. Error Handling

Add proper error handling:

```typescript
try {
  const hospitals = await getNearbyHospitals(lat, lng, radius);
  setHospitals(hospitals);
} catch (error: any) {
  if (error.message.includes('Authentication')) {
    // Redirect to login
    navigate('/auth');
  } else {
    // Show error message
    setError(error.message);
  }
}
```

## 8. Testing

1. Start backend server: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to Hospital Finder
4. Check browser console for API calls
5. Verify hospitals are displayed correctly

## 9. Production Deployment

### Backend
- Deploy to Vercel, Railway, or Render
- Set environment variables
- Update `VITE_API_BASE_URL` in frontend

### Frontend
- Update `.env.production` with backend URL
- Rebuild and deploy

## Troubleshooting

**CORS Errors:**
- Make sure backend CORS is configured correctly
- Check that frontend URL is allowed

**Authentication Errors:**
- Verify Supabase token is being sent
- Check token expiration
- Ensure backend has correct Supabase credentials

**No Hospitals Found:**
- Check coordinates are valid
- Increase radius
- Verify Overpass API is accessible

