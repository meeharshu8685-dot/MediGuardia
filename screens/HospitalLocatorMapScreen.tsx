import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Hospital } from '../types';
import { getNearbyHospitals, getAllHospitals } from '../services/hospitalService';
import { getCurrentLocation } from '../services/locationService';
import { BackArrowIcon, LocationMarkerIcon, PhoneIcon } from '../constants';
import { HospitalDetailModal } from '../components/HospitalDetailModal';

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

interface HospitalLocatorMapScreenProps {
    onBack: () => void;
}

export const HospitalLocatorMapScreen: React.FC<HospitalLocatorMapScreenProps> = ({ onBack }) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get user location and nearby hospitals
    useEffect(() => {
        const loadHospitals = async () => {
            try {
                setIsLoading(true);
                const location = await getCurrentLocation();
                const userPos = { lat: location.latitude, lng: location.longitude };
                
                setUserLocation(userPos);
                setMapCenter(userPos);
                
                const nearby = await getNearbyHospitals(location.latitude, location.longitude, 15);
                setHospitals(nearby.length > 0 ? nearby : getAllHospitals());
            } catch (err: any) {
                console.error('Error loading hospitals:', err);
                setError(err.message || 'Failed to load location');
                // Fallback to all hospitals if location fails
                setHospitals(getAllHospitals());
            } finally {
                setIsLoading(false);
            }
        };

        loadHospitals();
    }, []);

    const handleHospitalClick = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setMapCenter({ lat: hospital.latitude, lng: hospital.longitude });
        setShowDetailModal(true);
    };

    const handleGetDirections = (hospital: Hospital) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
        window.open(url, '_blank');
    };

    const filteredHospitals = searchQuery
        ? hospitals.filter(h => 
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.address.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : hospitals;

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-800 p-4 flex items-center shadow-sm">
                <button 
                    onClick={onBack}
                    className="mr-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Hospital Locator</h1>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <input
                    type="text"
                    placeholder="Search hospitals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 rounded-xl border-2 border-transparent focus:border-primary outline-none text-neutral-900 dark:text-neutral-100"
                />
            </div>

            {/* Map */}
            <div className="relative">
                {isLoading ? (
                    <div className="w-full h-96 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-neutral-600 dark:text-neutral-400">Loading map...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="w-full h-96 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <div className="text-center p-4">
                            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Showing all hospitals</p>
                        </div>
                    </div>
                ) : (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ? (
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={userLocation ? 13 : 12}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {/* User Location Marker */}
                            {userLocation && (
                                <Marker
                                    position={userLocation}
                                    title="Your Location"
                                />
                            )}

                            {/* Hospital Markers */}
                            {filteredHospitals.map((hospital) => (
                                <Marker
                                    key={hospital.id}
                                    position={{ lat: hospital.latitude, lng: hospital.longitude }}
                                    onClick={() => handleHospitalClick(hospital)}
                                    title={hospital.name}
                                />
                            ))}

                            {/* Info Window */}
                            {selectedHospital && (
                                <InfoWindow
                                    position={{ lat: selectedHospital.latitude, lng: selectedHospital.longitude }}
                                    onCloseClick={() => setSelectedHospital(null)}
                                >
                                    <div className="p-2">
                                        <h3 className="font-bold text-lg mb-1">{selectedHospital.name}</h3>
                                        <p className="text-sm text-neutral-600 mb-2">{selectedHospital.address}</p>
                                        {selectedHospital.distance && (
                                            <p className="text-sm text-primary mb-2">{selectedHospital.distance} km away</p>
                                        )}
                                        <button
                                            onClick={() => handleGetDirections(selectedHospital)}
                                            className="text-sm bg-primary text-white px-3 py-1 rounded-full font-semibold"
                                        >
                                            Get Directions
                                        </button>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </LoadScript>
                ) : (
                    <div className="w-full h-96 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <div className="text-center p-4">
                            <p className="text-red-600 dark:text-red-400 mb-2">Google Maps API key not configured</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file
                            </p>
                            <div className="w-full h-64 bg-neutral-300 dark:bg-neutral-600 rounded-xl flex items-center justify-center">
                                <p className="text-neutral-500 dark:text-neutral-400">Map placeholder</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hospital List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredHospitals.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        No hospitals found
                    </div>
                ) : (
                    filteredHospitals.map((hospital) => {
                        return (
                            <div
                                key={hospital.id}
                                onClick={() => handleHospitalClick(hospital)}
                                className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                                                {hospital.name}
                                            </h3>
                                            {hospital.emergencyServices && (
                                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    ER
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                                            {hospital.address}
                                        </p>
                                        {hospital.distance && (
                                            <p className="text-sm font-semibold text-primary">
                                                {hospital.distance} km away
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        {hospital.rating && (
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {hospital.rating}
                                                </span>
                                            </div>
                                        )}
                                        {hospital.openHours && (
                                            <span className={`text-sm font-semibold ${
                                                hospital.openHours === '24 Hours' 
                                                    ? 'text-accent-green' 
                                                    : 'text-accent-orange'
                                            }`}>
                                                {hospital.openHours}
                                            </span>
                                        )}
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`tel:${hospital.phone.replace(/\D/g, '')}`, '_self');
                                            }}
                                            className="flex items-center gap-1 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                                        >
                                            <PhoneIcon />
                                            Call
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-full">
                                        View Details
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Hospital Detail Modal */}
            {showDetailModal && selectedHospital && (
                <HospitalDetailModal
                    hospital={selectedHospital}
                    userLocation={userLocation}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedHospital(null);
                    }}
                    onGetDirections={handleGetDirections}
                />
            )}
        </div>
    );
};

