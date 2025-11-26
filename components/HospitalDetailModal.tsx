import React from 'react';
import { Hospital } from '../types';
import { getNearestHospitals } from '../services/hospitalService';
import { PhoneIcon, LocationMarkerIcon } from '../constants';

interface HospitalDetailModalProps {
    hospital: Hospital;
    userLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    onGetDirections: (hospital: Hospital) => void;
}

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
    hospital,
    userLocation,
    onClose,
    onGetDirections
}) => {
    const nearestHospitals = userLocation
        ? getNearestHospitals(hospital.id, userLocation.lat, userLocation.lng, 5)
        : [];

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Hospital Details</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Selected Hospital Details */}
                    <div className="bg-primary-light dark:bg-primary/20 p-6 rounded-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                        {hospital.name}
                                    </h3>
                                    {hospital.emergencyServices && (
                                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                                            ER
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                    {hospital.rating && (
                                        <div className="flex items-center gap-1">
                                            <div className="text-yellow-500">
                                                <StarIcon />
                                            </div>
                                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                                {hospital.rating}
                                            </span>
                                            {hospital.reviewCount && (
                                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    ({hospital.reviewCount} reviews)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {hospital.distance && (
                                        <span className="text-sm font-semibold text-primary">
                                            {hospital.distance} km away
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-start gap-2 mb-3">
                                    <div className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        <LocationMarkerIcon />
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300">{hospital.address}</p>
                                </div>
                                {hospital.openHours && (
                                    <p className={`text-sm font-semibold ${
                                        hospital.openHours === '24 Hours' 
                                            ? 'text-accent-green' 
                                            : 'text-accent-orange'
                                    }`}>
                                        {hospital.openHours}
                                    </p>
                                )}
                                {hospital.specialties && hospital.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {hospital.specialties.map((specialty, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded-full"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <a
                                href={`tel:${hospital.phone.replace(/\D/g, '')}`}
                                className="flex-1 bg-white dark:bg-neutral-700 text-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                            >
                                <PhoneIcon />
                                Call
                            </a>
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-primary text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                            >
                                <LocationMarkerIcon />
                                Go There
                            </a>
                        </div>
                    </div>

                    {/* Nearest Hospitals Section */}
                    {nearestHospitals.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                Nearest Hospitals
                            </h3>
                            <div className="space-y-3">
                                {nearestHospitals.map((nearbyHospital) => {
                                    const nearbyMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nearbyHospital.address)}`;
                                    
                                    return (
                                        <div
                                            key={nearbyHospital.id}
                                            className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-600"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                                                            {nearbyHospital.name}
                                                        </h4>
                                                        {nearbyHospital.emergencyServices && (
                                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                                ER
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        {nearbyHospital.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="text-yellow-500 w-4 h-4">
                                                                    <StarIcon />
                                                                </div>
                                                                <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                                                    {nearbyHospital.rating}
                                                                </span>
                                                                {nearbyHospital.reviewCount && (
                                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        ({nearbyHospital.reviewCount})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {nearbyHospital.distance && (
                                                            <span className="text-sm font-semibold text-primary">
                                                                {nearbyHospital.distance} km
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                                        {nearbyHospital.address}
                                                    </p>
                                                    {nearbyHospital.openHours && (
                                                        <p className={`text-xs font-semibold ${
                                                            nearbyHospital.openHours === '24 Hours' 
                                                                ? 'text-accent-green' 
                                                                : 'text-accent-orange'
                                                        }`}>
                                                            {nearbyHospital.openHours}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <a
                                                    href={`tel:${nearbyHospital.phone.replace(/\D/g, '')}`}
                                                    className="flex-1 bg-white dark:bg-neutral-600 text-primary font-semibold py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-500 transition-colors"
                                                >
                                                    <PhoneIcon />
                                                    Call
                                                </a>
                                                <a
                                                    href={nearbyMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 bg-primary text-white font-semibold py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                                                >
                                                    <LocationMarkerIcon />
                                                    Go There
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

