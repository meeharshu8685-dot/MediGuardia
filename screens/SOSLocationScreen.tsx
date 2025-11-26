import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { 
    getCurrentLocation, 
    getAddressFromCoordinates, 
    shareViaWhatsApp, 
    shareViaSMS,
    copyLocationToClipboard 
} from '../services/locationService';
import { CheckCircleIcon, LocationMarkerIcon, PhoneIcon } from '../constants';

interface SOSLocationScreenProps {
    emergencyContact?: {
        name: string;
        phone: string;
    };
}

export const SOSLocationScreen: React.FC<SOSLocationScreenProps> = ({ 
    emergencyContact = { name: 'Emergency Contact', phone: '911' } 
}) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadLocation();
    }, []);

    const loadLocation = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const loc = await getCurrentLocation();
            setLocation(loc);
            
            // Get address from coordinates
            const addr = await getAddressFromCoordinates(loc.latitude, loc.longitude);
            setAddress(addr);
        } catch (err: any) {
            console.error('Error getting location:', err);
            setError(err.message || 'Failed to get location');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareWhatsApp = () => {
        if (location) {
            shareViaWhatsApp(location, address);
        }
    };

    const handleShareSMS = () => {
        if (location) {
            shareViaSMS(location, emergencyContact.phone, address);
        }
    };

    const handleCopyLocation = async () => {
        if (location) {
            const success = await copyLocationToClipboard(location, address);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    const formatCoordinates = () => {
        if (!location) return 'N/A';
        return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    };

    const getGoogleMapsLink = () => {
        if (!location) return '#';
        return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 text-center">
                    Share Your Location
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-center mb-8">
                    Share your current location with emergency contacts
                </p>

                {isLoading ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 text-center shadow-lg">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-600 dark:text-neutral-400">Getting your location...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LocationMarkerIcon />
                        </div>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadLocation}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
                        >
                            Try Again
                        </button>
                    </div>
                ) : location ? (
                    <>
                        {/* Location Display Card */}
                        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-lg mb-6">
                            <div className="flex items-start mb-4">
                                <div className="w-12 h-12 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                    <div className="w-6 h-6 text-primary">
                                        <LocationMarkerIcon />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                        Current Location
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                                        {address || 'Address not available'}
                                    </p>
                                    <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                                        {formatCoordinates()}
                                    </p>
                                </div>
                            </div>

                            {/* Google Maps Link */}
                            <a
                                href={getGoogleMapsLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center bg-neutral-100 dark:bg-neutral-700 text-primary font-semibold py-2 rounded-xl mb-4 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                            >
                                Open in Google Maps
                            </a>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopyLocation}
                                className="w-full bg-primary-light dark:bg-primary/20 text-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/30 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircleIcon />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <span>Copy Location</span>
                                )}
                            </button>
                        </div>

                        {/* Share Options */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                                Share Via
                            </h3>

                            {/* WhatsApp Share */}
                            <button
                                onClick={handleShareWhatsApp}
                                className="w-full bg-green-500 text-white p-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-green-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Share via WhatsApp
                            </button>

                            {/* SMS Share */}
                            <button
                                onClick={handleShareSMS}
                                className="w-full bg-blue-500 text-white p-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:bg-blue-600 transition-colors"
                            >
                                <div className="w-6 h-6">
                                    <PhoneIcon />
                                </div>
                                Share via SMS ({emergencyContact.name})
                            </button>

                            {/* Emergency Contact Info */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                                            Emergency Contact
                                        </p>
                                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {emergencyContact.name}
                                        </p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {emergencyContact.phone}
                                        </p>
                                    </div>
                                    <a
                                        href={`tel:${emergencyContact.phone.replace(/\D/g, '')}`}
                                        className="bg-primary text-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <PhoneIcon />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={loadLocation}
                            className="w-full mt-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 p-3 rounded-xl font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                            Refresh Location
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

