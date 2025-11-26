import React, { useState, useEffect, useRef } from 'react';
import { BackArrowIcon, CheckCircleIcon, LocationMarkerIcon, PhoneIcon, BreathingIcon, ChestPainIcon, BleedingIcon, FeverIcon, AllergyIcon, BurnIcon } from '../constants';

const firstAidData = {
    "Breathing Difficulty": {
        steps: [
            "Call emergency services immediately.",
            "Check the person's airway and remove any obstructions.",
            "If trained, begin CPR if the person is not breathing.",
            "Keep the person comfortable and loosen any tight clothing."
        ],
        warning: "Breathing difficulties can be life-threatening. Seek immediate medical help."
    },
    "Chest Pain": {
        steps: [
            "Call emergency services immediately, as this could be a heart attack.",
            "Have the person sit down and rest in a comfortable position.",
            "Loosen any tight clothing around their neck.",
            "If they have medication for a known heart condition, help them take it."
        ],
        warning: "Never ignore chest pain. It is a medical emergency."
    },
    "Bleeding": {
        steps: [
            "Apply firm, direct pressure on the wound with a clean cloth or bandage.",
            "If possible, elevate the injured limb above the heart.",
            "Do not remove any objects impaled in the wound.",
            "If bleeding is severe and doesn't stop, continue pressure and wait for emergency help."
        ],
        warning: "Severe, uncontrolled bleeding requires immediate professional medical attention."
    },
    "Fever": {
        steps: [
            "Take the person's temperature.",
            "Encourage them to drink plenty of fluids like water or broth.",
            "Use a lukewarm sponge bath; do not use cold water.",
            "Over-the-counter fever reducers like acetaminophen or ibuprofen can be used if appropriate."
        ],
        warning: "Seek medical advice for very high fevers (above 103°F or 39.4°C) or fevers lasting more than a few days."
    },
    "Allergies": {
        steps: [
            "If the person has a known severe allergy, help them use their epinephrine auto-injector (EpiPen).",
            "Call emergency services for any severe reactions (anaphylaxis), like difficulty breathing or swelling of the face/lips.",
            "For mild reactions, an over-the-counter antihistamine may help.",
            "Try to identify and remove the allergen if possible."
        ],
        warning: "Anaphylaxis is a life-threatening emergency. Use an auto-injector and call for an ambulance."
    },
    "Burns": {
        steps: [
            "For minor burns, cool the burn with cool (not cold) running water for 10-15 minutes.",
            "Cover the burn with a sterile, non-adhesive bandage or clean cloth.",
            "Do not apply ice, butter, or ointments to the burn.",
            "For major burns, call emergency services and do not remove burnt clothing."
        ],
        warning: "Severe burns or burns on the face, hands, feet, or genitals require immediate medical care."
    },
};


const firstAidCategories = [
    { name: "Breathing Difficulty", icon: <BreathingIcon /> }, 
    { name: "Chest Pain", icon: <ChestPainIcon /> },
    { name: "Bleeding", icon: <BleedingIcon /> }, 
    { name: "Fever", icon: <FeverIcon /> },
    { name: "Allergies", icon: <AllergyIcon /> }, 
    { name: "Burns", icon: <BurnIcon /> },
];

const FirstAidCategoriesView: React.FC<{ onSelect: (category: string) => void }> = ({ onSelect }) => (
    <div>
        <h1 className="text-3xl font-bold text-neutral-900 text-center mb-8">First Aid</h1>
        <div className="grid grid-cols-2 gap-4">
            {firstAidCategories.map(cat => (
                <div key={cat.name} onClick={() => onSelect(cat.name)} className="bg-white p-4 rounded-3xl shadow-sm text-center cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-primary-light">
                        <div className="w-8 h-8 text-primary">{cat.icon}</div>
                    </div>
                    <p className="font-bold text-neutral-800">{cat.name}</p>
                </div>
            ))}
        </div>
    </div>
);

const FirstAidDetailView: React.FC<{ category: string, onBack: () => void }> = ({ category, onBack }) => {
    const data = firstAidData[category as keyof typeof firstAidData] || { steps: [], warning: "" };

    return (
        <div>
            <div className="relative flex items-center justify-center mb-6">
                <button onClick={onBack} className="absolute left-0 text-gray-700 bg-white p-3 rounded-full shadow-sm"><BackArrowIcon /></button>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">{category}</h1>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
                <p className="font-bold">Important Warning</p>
                <p>{data.warning}</p>
            </div>
            <div className="space-y-4">
                {data.steps.map((step, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-md flex items-start">
                        <div className="mr-4 flex-shrink-0 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">{i + 1}</div>
                        <p className="text-gray-800">{step}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SOSView: React.FC = () => {
    const [isSending, setIsSending] = useState(false);
    const [alertSent, setAlertSent] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [location, setLocation] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    const emergencyContact = { name: "Jane Doe", phone: "123-456-7890" };

    const startCountdown = () => {
        setIsSending(true);
        setCountdown(5);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    };

    const sendAlert = () => {
        setAlertSent(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`);
            },
            () => {
                setLocation("Location access denied.");
            }
        );
    };

    const cancelSOS = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsSending(false);
        setCountdown(5);
    };
    
    useEffect(() => {
        if (countdown <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsSending(false);
            sendAlert();
        }
    }, [countdown]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, []);

    if (alertSent) {
        return (
            <div className="text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <div className="w-12 h-12"><CheckCircleIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Alert Sent</h1>
                <p className="text-gray-600 max-w-sm mb-8">Help is on the way. Your location and emergency contacts have been notified.</p>

                <div className="bg-white p-6 rounded-2xl shadow-lg w-full text-left space-y-4">
                    <div className="flex items-start">
                        <div className="w-6 h-6 mr-3 text-gray-400 mt-1 flex-shrink-0"><LocationMarkerIcon /></div>
                        <div>
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Your Location</h3>
                            <p className="font-mono mt-1 text-md text-gray-800">{location || "Getting location..."}</p>
                        </div>
                    </div>
                    <div className="border-t pt-4 flex items-start">
                        <div className="w-6 h-6 mr-3 text-gray-400 mt-1 flex-shrink-0"><PhoneIcon /></div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Notified Contact</h3>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-bold text-blue-600">
                                        {emergencyContact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{emergencyContact.name}</p>
                                        <p className="text-sm text-gray-500">{emergencyContact.phone}</p>
                                    </div>
                                </div>
                                <a href={`tel:${emergencyContact.phone.replace(/-/g, '')}`} className="bg-primary text-white px-4 py-2 rounded-full font-semibold flex items-center space-x-2 text-sm shadow-md hover:shadow-lg active:scale-95 transition-all duration-200">
                                    <div className="w-4 h-4"><PhoneIcon /></div>
                                    <span>Call</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-left bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg w-full">
                    <h4 className="font-bold text-blue-800">What to do now:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                        <li>Stay as calm as possible.</li>
                        <li>If it is safe, stay in your current location.</li>
                        <li>Keep your phone line open.</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center flex flex-col items-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Emergency SOS</h1>
            <p className="text-gray-600 max-w-sm mb-8">Press the button below to send an emergency alert. A 5-second countdown will begin.</p>
            <div className="flex items-center justify-center">
                <button
                    onClick={startCountdown}
                    disabled={isSending}
                    className="relative w-48 h-48 bg-red-500 text-white rounded-full flex flex-col items-center justify-center text-4xl font-bold shadow-2xl transition-transform duration-200 active:scale-95 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                    {!isSending && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>}
                    <span className="relative z-10">{isSending ? countdown : "SOS"}</span>
                    {isSending && <span className="relative z-10 text-lg font-semibold mt-1">Sending...</span>}
                </button>
            </div>
            {isSending && (
                <button onClick={cancelSOS} className="mt-8 bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full transition-opacity hover:opacity-80">
                    Cancel
                </button>
            )}
        </div>
    );
};

const HospitalLocatorView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold text-neutral-900 text-center mb-6">Hospital Locator</h1>
        <div className="mb-4">
            <input type="text" placeholder="Search for hospitals, clinics..." className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-primary outline-none shadow-sm text-lg" />
        </div>
        <div className="w-full h-48 bg-neutral-200 rounded-2xl mb-4 flex items-center justify-center text-neutral-500 overflow-hidden">
            <img src="https://i.imgur.com/gK2E2p8.png" alt="Map placeholder" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-3">
            {[
                {name: "City General Hospital", address: "123 Main St, Downtown", open: "24 Hours", distance: "0.8 miles"}, 
                {name: "Oak Valley Clinic", address: "456 Oak Ave, Suburbia", open: "9am - 5pm", distance: "2.3 miles"}
            ].map(h =>(
                <div key={h.name} className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{h.name}</h3>
                            <p className="text-sm text-neutral-500">{h.address}</p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-600">{h.distance}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100">
                        <span className={`text-sm font-bold ${h.open === '24 Hours' ? 'text-accent-green' : 'text-accent-orange'}`}>{h.open}</span>
                        <button className="text-sm font-semibold text-primary bg-primary-light px-4 py-2 rounded-full">Directions</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export const EmergencyScreen: React.FC<{ view: string; navigate: (view: string) => void }> = ({ view, navigate }) => {
    const [currentView, setCurrentView] = useState(view.split('/')[1] || 'sos');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const path = view.split('/')[1] || 'sos';
        setCurrentView(path);
    }, [view]);

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setCurrentView('first-aid-detail');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentView('first-aid');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'sos':
                return <SOSView />;
            case 'first-aid':
                return <FirstAidCategoriesView onSelect={handleSelectCategory} />;
            case 'first-aid-detail':
                return <FirstAidDetailView category={selectedCategory || "Details"} onBack={handleBackToCategories} />;
            case 'hospitals':
                return <HospitalLocatorView />;
            default:
                return <SOSView />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 pt-10 p-6">
            {renderContent()}
        </div>
    );
};