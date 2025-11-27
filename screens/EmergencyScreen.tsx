import React, { useState, useEffect, useRef } from 'react';
import { BackArrowIcon, CheckCircleIcon, LocationMarkerIcon, PhoneIcon, BreathingIcon, ChestPainIcon, BleedingIcon, FeverIcon, AllergyIcon, BurnIcon } from '../constants';
import { HospitalLocatorMapScreen } from './HospitalLocatorMapScreen';
import { SOSLocationScreen } from './SOSLocationScreen';
import { createSOSLog, generateWhatsAppShareLink, generateSMSShareLink, generateEmailShareLink, generateEnhancedWhatsAppShareLink } from '../features/sos/sosService';
import { analyzeEmergencySeverity, generateFirstAidGuide, generateSOSMessage, EmergencySeverityResult, FirstAidGuide } from '../services/geminiService';
import { UserProfile } from '../types';

type EmergencyCategory = 'accident' | 'heart' | 'breathing' | 'bleeding' | 'fire' | 'allergy' | 'unknown';

interface EmergencyCategoryOption {
    id: EmergencyCategory;
    name: string;
    icon: React.ReactNode;
    color: string;
}

const emergencyCategories: EmergencyCategoryOption[] = [
    { id: 'accident', name: 'Accident / Injury', icon: <BleedingIcon />, color: 'bg-red-500' },
    { id: 'heart', name: 'Heart / Chest Issue', icon: <ChestPainIcon />, color: 'bg-red-600' },
    { id: 'breathing', name: 'Breathing Issue', icon: <BreathingIcon />, color: 'bg-orange-500' },
    { id: 'bleeding', name: 'Bleeding', icon: <BleedingIcon />, color: 'bg-red-700' },
    { id: 'fire', name: 'Fire / Burn', icon: <BurnIcon />, color: 'bg-orange-600' },
    { id: 'allergy', name: 'Allergy / Anaphylaxis', icon: <AllergyIcon />, color: 'bg-yellow-500' },
    { id: 'unknown', name: 'Unknown Emergency', icon: <PhoneIcon />, color: 'bg-gray-500' },
];

const categoryToFirstAidMap: Record<EmergencyCategory, string> = {
    'accident': 'Accident / Injury',
    'heart': 'Chest Pain',
    'breathing': 'Breathing Difficulty',
    'bleeding': 'Bleeding',
    'fire': 'Burns',
    'allergy': 'Allergies',
    'unknown': 'General Emergency',
};

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
    "Accident / Injury": {
        steps: [
            "Call emergency services immediately.",
            "Do not move the person unless they are in immediate danger.",
            "Check for responsiveness and breathing.",
            "Control any bleeding with direct pressure.",
            "Keep the person warm and comfortable until help arrives."
        ],
        warning: "Do not move someone with a suspected spinal injury. Wait for professional medical help."
    },
    "General Emergency": {
        steps: [
            "Call emergency services immediately (911 or local emergency number).",
            "Stay calm and assess the situation.",
            "Provide basic first aid if trained and safe to do so.",
            "Keep the person comfortable and monitor their condition.",
            "Do not give food or water if they are unconscious."
        ],
        warning: "When in doubt, always call for professional medical help."
    },
};

const FirstAidCategoriesView: React.FC<{ onSelect: (category: string) => void }> = ({ onSelect }) => (
    <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-8">First Aid</h1>
        <div className="grid grid-cols-2 gap-4">
            {Object.keys(firstAidData).map(cat => {
                const categoryData = firstAidData[cat as keyof typeof firstAidData];
                return (
                    <div 
                        key={cat} 
                        onClick={() => onSelect(cat)} 
                        className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-sm text-center cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center"
                    >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-red-100 dark:bg-red-900/30">
                            <div className="w-8 h-8 text-red-600 dark:text-red-400">
                                {cat === 'Breathing Difficulty' && <BreathingIcon />}
                                {cat === 'Chest Pain' && <ChestPainIcon />}
                                {cat === 'Bleeding' && <BleedingIcon />}
                                {cat === 'Burns' && <BurnIcon />}
                                {cat === 'Allergies' && <AllergyIcon />}
                                {cat === 'Fever' && <FeverIcon />}
                                {cat === 'Accident / Injury' && <BleedingIcon />}
                                {cat === 'General Emergency' && <PhoneIcon />}
                            </div>
                        </div>
                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{cat}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const FirstAidDetailView: React.FC<{ category: string, onBack: () => void; aiGuide?: FirstAidGuide }> = ({ category, onBack, aiGuide }) => {
    const data = firstAidData[category as keyof typeof firstAidData] || { steps: [], warning: "" };
    const steps = aiGuide?.steps || data.steps;
    const warning = aiGuide?.warning || data.warning;

    return (
        <div>
            <div className="relative flex items-center justify-center mb-6">
                <button onClick={onBack} className="absolute left-0 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm"><BackArrowIcon /></button>
                <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-neutral-100">{category}</h1>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6" role="alert">
                <p className="font-bold">Important Warning</p>
                <p>{warning}</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-3">First Aid Steps</h3>
                {steps.map((step, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-md flex items-start">
                        <div className="mr-4 flex-shrink-0 bg-[#1a5f3f] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">{i + 1}</div>
                        <p className="text-gray-800 dark:text-neutral-200">{step}</p>
                    </div>
                ))}
            </div>
            {aiGuide && (
                <>
                    {aiGuide.dos.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-3">Do's</h3>
                            {aiGuide.dos.map((doItem, i) => (
                                <div key={i} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-start">
                                    <div className="mr-3 text-green-600 dark:text-green-400">✓</div>
                                    <p className="text-gray-800 dark:text-neutral-200">{doItem}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {aiGuide.donts.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-3">Don'ts</h3>
                            {aiGuide.donts.map((dont, i) => (
                                <div key={i} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-start">
                                    <div className="mr-3 text-red-600 dark:text-red-400">✗</div>
                                    <p className="text-gray-800 dark:text-neutral-200">{dont}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const EmergencyMedicalInfoCard: React.FC<{ user: UserProfile; onClose: () => void }> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">My Medical Information</h2>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                        <span className="font-semibold text-gray-900 dark:text-neutral-100">{user.name}</span>
                    </div>
                    {user.age && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Age:</span>
                            <span className="font-semibold text-gray-900 dark:text-neutral-100">{user.age} years</span>
                        </div>
                    )}
                    {user.gender && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                            <span className="font-semibold text-gray-900 dark:text-neutral-100">{user.gender}</span>
                        </div>
                    )}
                    {user.bloodGroup && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Blood Group:</span>
                            <span className="font-semibold text-gray-900 dark:text-neutral-100">{user.bloodGroup}</span>
                        </div>
                    )}
                    {user.allergies && user.allergies.length > 0 && (
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Allergies:</span>
                            <p className="font-semibold text-gray-900 dark:text-neutral-100 mt-1">{user.allergies.join(', ')}</p>
                        </div>
                    )}
                    {user.chronicConditions && user.chronicConditions.length > 0 && (
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Chronic Conditions:</span>
                            <p className="font-semibold text-gray-900 dark:text-neutral-100 mt-1">{user.chronicConditions.join(', ')}</p>
                        </div>
                    )}
                    {user.emergencyContact && (
                        <div className="pt-4 border-t">
                            <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
                            <p className="font-semibold text-gray-900 dark:text-neutral-100 mt-1">{user.emergencyContact.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{user.emergencyContact.phone}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AISeverityAnalyzer: React.FC<{ 
    onComplete: (result: EmergencySeverityResult) => void; 
    onBack: () => void;
}> = ({ onComplete, onBack }) => {
    const [answers, setAnswers] = useState({
        bleeding: false,
        conscious: true,
        breathingNormally: true,
    });
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const questions = [
        { id: 'bleeding', text: 'Are you bleeding?', key: 'bleeding' as keyof typeof answers },
        { id: 'conscious', text: 'Are you conscious?', key: 'conscious' as keyof typeof answers },
        { id: 'breathing', text: 'Are you breathing normally?', key: 'breathingNormally' as keyof typeof answers },
    ];

    const handleAnswer = (value: boolean) => {
        const key = questions[currentQuestion].key;
        setAnswers({ ...answers, [key]: value });
    };

    const handleNext = async () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // All questions answered, analyze
            setLoading(true);
            try {
                const result = await analyzeEmergencySeverity(answers);
                onComplete(result);
            } catch (error) {
                console.error('Error analyzing severity:', error);
                // Fallback
                const fallback: EmergencySeverityResult = {
                    riskLevel: answers.bleeding || !answers.conscious || !answers.breathingNormally ? 'High Risk' : 'Moderate Risk',
                    message: answers.bleeding || !answers.conscious || !answers.breathingNormally 
                        ? 'This is high risk - Seek help immediately' 
                        : 'Low risk but monitor closely',
                    urgency: 'Seek medical attention',
                };
                onComplete(fallback);
            } finally {
                setLoading(false);
            }
        }
    };

    const q = questions[currentQuestion];

    return (
        <div className="p-6">
            <div className="mb-6">
                <button onClick={onBack} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">Emergency Assessment</h2>
                <p className="text-gray-600 dark:text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-6">{q.text}</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => handleAnswer(true)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                            answers[q.key] === true
                                ? 'bg-[#1a5f3f] text-white border-2 border-[#1a5f3f]'
                                : 'bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-600'
                        }`}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                            answers[q.key] === false
                                ? 'bg-[#1a5f3f] text-white border-2 border-[#1a5f3f]'
                                : 'bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-600'
                        }`}
                    >
                        No
                    </button>
                </div>
            </div>
            <button
                onClick={handleNext}
                disabled={loading || answers[q.key] === undefined}
                className={`w-full py-4 rounded-xl font-semibold ${
                    answers[q.key] !== undefined && !loading
                        ? 'bg-[#1a5f3f] text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                {loading ? 'Analyzing...' : currentQuestion === questions.length - 1 ? 'Get Assessment' : 'Next'}
            </button>
        </div>
    );
};

const SeverityResultView: React.FC<{ 
    result: EmergencySeverityResult; 
    onBack: () => void;
    onContinue: () => void;
}> = ({ result, onBack, onContinue }) => {
    const riskColors = {
        'Low Risk': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'Moderate Risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        'High Risk': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse',
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <button onClick={onBack} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>
            <div className="text-center mb-8">
                <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg mb-4 ${riskColors[result.riskLevel]}`}>
                    {result.riskLevel}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">{result.message}</h2>
                <p className="text-gray-600 dark:text-gray-400">{result.urgency}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4">Assessment Details</h3>
                <p className="text-gray-700 dark:text-neutral-300">{result.message}</p>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 py-4 rounded-xl font-semibold"
                >
                    Back
                </button>
                <button
                    onClick={onContinue}
                    className="flex-1 bg-[#1a5f3f] text-white py-4 rounded-xl font-semibold hover:opacity-90"
                >
                    Continue to SOS
                </button>
            </div>
        </div>
    );
};

interface SOSViewProps {
    onShareLocation?: () => void;
    emergencyContact?: {
        name: string;
        phone: string;
    };
    user?: UserProfile;
    selectedCategory?: EmergencyCategory;
    emergencyNotes?: string;
    aiSOSMessage?: string;
}

const SOSView: React.FC<SOSViewProps> = ({ 
    onShareLocation, 
    emergencyContact = { name: "Emergency Contact", phone: "911" },
    user,
    selectedCategory,
    emergencyNotes,
    aiSOSMessage,
}) => {
    const [isSending, setIsSending] = useState(false);
    const [alertSent, setAlertSent] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const timerRef = useRef<number | null>(null);

    const startCountdown = () => {
        setIsSending(true);
        setCountdown(5);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    };

    const sendAlert = async () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(loc);
                
                // Save to Firestore
                try {
                    await createSOSLog(loc.lat, loc.lng);
                } catch (error) {
                    console.error('Error saving SOS log:', error);
                }
                
                setAlertSent(true);
                setShowShareOptions(true);
            },
            () => {
                setLocation({ lat: 0, lng: 0 });
                setAlertSent(true);
                setShowShareOptions(true);
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
        };
    }, []);

    const handleShare = (method: 'whatsapp' | 'sms' | 'email') => {
        if (!location) return;
        
        const message = aiSOSMessage || `🚨 EMERGENCY SOS 🚨\n\n${user?.name || 'User'} is experiencing ${selectedCategory ? emergencyCategories.find(c => c.id === selectedCategory)?.name : 'an emergency'}.\n\nLocation: ${location.lat}, ${location.lng}\n\nGoogle Maps: https://www.google.com/maps?q=${location.lat},${location.lng}${emergencyNotes ? `\n\nAdditional Info: ${emergencyNotes}` : ''}\n\nPlease respond immediately.`;
        
        let url = '';
        if (method === 'whatsapp') {
            url = generateEnhancedWhatsAppShareLink(location.lat, location.lng, location.address, message, emergencyContact.phone);
        } else if (method === 'sms') {
            url = generateSMSShareLink(location.lat, location.lng, location.address, message);
        } else if (method === 'email') {
            url = generateEmailShareLink(location.lat, location.lng, location.address, message);
        }
        
        window.open(url, '_blank');
    };

    if (alertSent) {
        return (
            <div className="text-center flex flex-col items-center p-6">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <div className="w-12 h-12"><CheckCircleIcon /></div>
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-neutral-100 mb-4">Alert Sent</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8">Help is on the way. Your location and emergency contacts have been notified.</p>

                <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg w-full text-left space-y-4 mb-6">
                    <div className="flex items-start">
                        <div className="w-6 h-6 mr-3 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0"><LocationMarkerIcon /></div>
                        <div>
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Your Location</h3>
                            <p className="font-mono mt-1 text-md text-gray-800 dark:text-neutral-200">
                                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Getting location..."}
                            </p>
                            {location && (
                                <a 
                                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 text-sm mt-1 underline"
                                >
                                    Open in Google Maps
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="border-t dark:border-neutral-700 pt-4 flex items-start">
                        <div className="w-6 h-6 mr-3 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0"><PhoneIcon /></div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Emergency Contact</h3>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 font-bold text-blue-600 dark:text-blue-400">
                                        {emergencyContact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-neutral-200">{emergencyContact.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{emergencyContact.phone}</p>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${emergencyContact.phone.replace(/[^0-9]/g, '')}`} 
                                    className="bg-[#1a5f3f] text-white px-4 py-2 rounded-full font-semibold flex items-center space-x-2 text-sm shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
                                >
                                    <div className="w-4 h-4"><PhoneIcon /></div>
                                    <span>Call</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {showShareOptions && location && (
                    <div className="w-full mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4">Share Emergency Alert</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="bg-green-500 text-white p-4 rounded-xl font-semibold flex flex-col items-center space-y-2 hover:bg-green-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                <span className="text-xs">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => handleShare('sms')}
                                className="bg-blue-500 text-white p-4 rounded-xl font-semibold flex flex-col items-center space-y-2 hover:bg-blue-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-xs">SMS</span>
                            </button>
                            <button
                                onClick={() => handleShare('email')}
                                className="bg-gray-500 text-white p-4 rounded-xl font-semibold flex flex-col items-center space-y-2 hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs">Email</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-left bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-r-lg w-full">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300">What to do now:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                        <li>Stay as calm as possible.</li>
                        <li>If it is safe, stay in your current location.</li>
                        <li>Keep your phone line open.</li>
                    </ul>
                </div>

                {onShareLocation && (
                    <button
                        onClick={onShareLocation}
                        className="mt-6 w-full bg-[#1a5f3f] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                    >
                        <LocationMarkerIcon />
                        Share Location Details
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="text-center flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-neutral-100 mb-4">Emergency SOS</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8">Press the button below to send an emergency alert. A 5-second countdown will begin.</p>
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
                <button onClick={cancelSOS} className="mt-8 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-200 font-bold py-3 px-8 rounded-full transition-opacity hover:opacity-80">
                    Cancel
                </button>
            )}
        </div>
    );
};

const EmergencyCategorySelection: React.FC<{ 
    onSelect: (category: EmergencyCategory) => void; 
    onBack: () => void;
}> = ({ onSelect, onBack }) => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <button onClick={onBack} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
                    <BackArrowIcon />
                </button>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-8">Select Emergency Type</h1>
            <div className="grid grid-cols-2 gap-4">
                {emergencyCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`${cat.color} text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center space-y-3`}
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-10 h-10 text-white">{cat.icon}</div>
                        </div>
                        <p className="font-bold text-center">{cat.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const EmergencySOSFlow: React.FC<{
    user: UserProfile;
    onBack: () => void;
    onShareLocation?: () => void;
}> = ({ user, onBack, onShareLocation }) => {
    const [step, setStep] = useState<'category' | 'severity' | 'severity-result' | 'notes' | 'sos'>('category');
    const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
    const [severityResult, setSeverityResult] = useState<EmergencySeverityResult | null>(null);
    const [firstAidGuide, setFirstAidGuide] = useState<FirstAidGuide | null>(null);
    const [emergencyNotes, setEmergencyNotes] = useState('');
    const [aiSOSMessage, setAiSOSMessage] = useState('');
    const [loadingFirstAid, setLoadingFirstAid] = useState(false);
    const [loadingSOSMessage, setLoadingSOSMessage] = useState(false);

    const handleCategorySelect = async (category: EmergencyCategory) => {
        setSelectedCategory(category);
        setLoadingFirstAid(true);
        try {
            const guide = await generateFirstAidGuide(categoryToFirstAidMap[category]);
            setFirstAidGuide(guide);
        } catch (error) {
            console.error('Error generating first aid guide:', error);
        } finally {
            setLoadingFirstAid(false);
        }
        setStep('severity');
    };

    const handleSeverityComplete = (result: EmergencySeverityResult) => {
        setSeverityResult(result);
        setStep('severity-result');
    };

    const handleContinueToNotes = () => {
        setStep('notes');
    };

    const handleSendSOS = async () => {
        if (!selectedCategory || !user) return;
        
        setLoadingSOSMessage(true);
        try {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    
                    const message = await generateSOSMessage({
                        name: user.name,
                        category: emergencyCategories.find(c => c.id === selectedCategory)?.name || 'Emergency',
                        location,
                        notes: emergencyNotes,
                        severity: severityResult?.riskLevel || 'Unknown',
                    });
                    setAiSOSMessage(message);
                    setStep('sos');
                },
                () => {
                    // Location denied, use default
                    generateSOSMessage({
                        name: user.name,
                        category: emergencyCategories.find(c => c.id === selectedCategory)?.name || 'Emergency',
                        location: { lat: 0, lng: 0 },
                        notes: emergencyNotes,
                        severity: severityResult?.riskLevel || 'Unknown',
                    }).then(message => {
                        setAiSOSMessage(message);
                        setStep('sos');
                    });
                }
            );
        } catch (error) {
            console.error('Error generating SOS message:', error);
            setStep('sos');
        } finally {
            setLoadingSOSMessage(false);
        }
    };

    if (step === 'category') {
        return <EmergencyCategorySelection onSelect={handleCategorySelect} onBack={onBack} />;
    }

    if (step === 'severity') {
        return <AISeverityAnalyzer onComplete={handleSeverityComplete} onBack={() => setStep('category')} />;
    }

    if (step === 'severity-result') {
        return (
            <SeverityResultView 
                result={severityResult!} 
                onBack={() => setStep('severity')} 
                onContinue={handleContinueToNotes}
            />
        );
    }

    if (step === 'notes') {
        const categoryName = selectedCategory ? emergencyCategories.find(c => c.id === selectedCategory)?.name : 'Emergency';
        const firstAidCategory = selectedCategory ? categoryToFirstAidMap[selectedCategory] : 'General Emergency';
        
        return (
            <div className="p-6 min-h-screen">
                <div className="mb-6">
                    <button onClick={() => setStep('severity-result')} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-sm">
                        <BackArrowIcon />
                    </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">Emergency: {categoryName}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Describe your emergency (optional)</p>
                
                <textarea
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    placeholder="e.g., I fell and hit my head, experiencing dizziness..."
                    className="w-full h-32 p-4 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 focus:border-[#1a5f3f] focus:ring-2 focus:ring-[#1a5f3f]/20 outline-none transition text-gray-900 dark:text-neutral-100 mb-6"
                />

                {firstAidGuide && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4">First Aid Steps</h3>
                        <div className="space-y-3">
                            {firstAidGuide.steps.map((step, i) => (
                                <div key={i} className="flex items-start">
                                    <div className="mr-3 flex-shrink-0 bg-[#1a5f3f] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</div>
                                    <p className="text-gray-800 dark:text-neutral-200">{step}</p>
                                </div>
                            ))}
                        </div>
                        {firstAidGuide.dos.length > 0 && (
                            <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                                <h4 className="font-bold text-gray-900 dark:text-neutral-100 mb-2">Do's:</h4>
                                <ul className="space-y-1">
                                    {firstAidGuide.dos.map((doItem, i) => (
                                        <li key={i} className="text-gray-700 dark:text-neutral-300 flex items-start">
                                            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                                            {doItem}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {firstAidGuide.donts.length > 0 && (
                            <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                                <h4 className="font-bold text-gray-900 dark:text-neutral-100 mb-2">Don'ts:</h4>
                                <ul className="space-y-1">
                                    {firstAidGuide.donts.map((dont, i) => (
                                        <li key={i} className="text-gray-700 dark:text-neutral-300 flex items-start">
                                            <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                                            {dont}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                            <p className="text-red-600 dark:text-red-400 font-semibold">⚠️ {firstAidGuide.warning}</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={() => setStep('severity-result')}
                        className="flex-1 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 py-4 rounded-xl font-semibold"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSendSOS}
                        disabled={loadingSOSMessage}
                        className="flex-1 bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loadingSOSMessage ? (
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Send SOS'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'sos') {
        return (
            <SOSView
                onShareLocation={onShareLocation}
                emergencyContact={user.emergencyContact || { name: 'Emergency Contact', phone: '911' }}
                user={user}
                selectedCategory={selectedCategory || undefined}
                emergencyNotes={emergencyNotes}
                aiSOSMessage={aiSOSMessage}
            />
        );
    }

    return null;
};

export const EmergencyScreen: React.FC<{ view: string; navigate: (view: string) => void; user?: UserProfile }> = ({ view, navigate, user }) => {
    const [currentView, setCurrentView] = useState(view.split('/')[1] || 'sos');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showMedicalInfo, setShowMedicalInfo] = useState(false);
    const [showEmergencyFlow, setShowEmergencyFlow] = useState(false);

    useEffect(() => {
        const path = view.split('/')[1] || 'sos';
        setCurrentView(path);
        if (path === 'sos') {
            setShowEmergencyFlow(true);
        } else {
            setShowEmergencyFlow(false);
        }
    }, [view]);

    const handleSelectCategory = (category: string) => {
        setSelectedCategory(category);
        setCurrentView('first-aid-detail');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setCurrentView('first-aid');
    };

    const handleBackToSOS = () => {
        setCurrentView('sos');
        setShowEmergencyFlow(true);
        navigate('sos/sos');
    };

    const emergencyContact = user?.emergencyContact || { name: 'Emergency Contact', phone: '911' };

    const handleShareLocation = () => {
        setCurrentView('location-share');
        navigate('sos/location-share');
    };

    const renderContent = () => {
        if (showEmergencyFlow && currentView === 'sos') {
            return (
                <EmergencySOSFlow
                    user={user || { name: 'User', email: '', avatarUrl: '' }}
                    onBack={() => {
                        setShowEmergencyFlow(false);
                        navigate('home');
                    }}
                    onShareLocation={handleShareLocation}
                />
            );
        }

        switch (currentView) {
            case 'location-share':
                return <SOSLocationScreen emergencyContact={emergencyContact} />;
            case 'first-aid':
                return <FirstAidCategoriesView onSelect={handleSelectCategory} />;
            case 'first-aid-detail':
                return <FirstAidDetailView category={selectedCategory || "Details"} onBack={handleBackToCategories} />;
            case 'hospitals':
                return <HospitalLocatorMapScreen onBack={handleBackToSOS} />;
            default:
                return (
                    <EmergencySOSFlow
                        user={user || { name: 'User', email: '', avatarUrl: '' }}
                        onBack={() => navigate('home')}
                        onShareLocation={handleShareLocation}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
            {showMedicalInfo && user && (
                <EmergencyMedicalInfoCard user={user} onClose={() => setShowMedicalInfo(false)} />
            )}
            {renderContent()}
            {currentView === 'sos' && !showEmergencyFlow && user && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setShowMedicalInfo(true)}
                        className="bg-[#1a5f3f] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Show My Info</span>
                    </button>
                </div>
            )}
        </div>
    );
};
