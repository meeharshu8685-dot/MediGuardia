
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface MedicalQuizProps {
    initialProfile: UserProfile;
    onComplete: (newProfile: UserProfile) => void;
    onClose: () => void;
}

const quizData = {
    bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    commonAllergies: ["Pollen", "Peanuts", "Dust Mites", "Dairy", "Gluten", "Shellfish"],
    commonConditions: ["Asthma", "Diabetes", "Hypertension", "Migraines", "Arthritis"],
};

const TOTAL_STEPS = 5;

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
        <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
        ></div>
    </div>
);

const OptionButton: React.FC<{ label: string, isSelected: boolean, onClick: () => void }> = ({ label, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full p-3 border-2 rounded-xl font-semibold transition-colors text-center ${isSelected ? 'bg-primary-light border-primary text-primary' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary/50'}`}
    >
        {label}
    </button>
);


export const MedicalQuizScreen: React.FC<MedicalQuizProps> = ({ initialProfile, onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    // Initialize with existing profile data, preserving height and weight
    const [profileData, setProfileData] = useState<UserProfile>({
        ...initialProfile,
        height: initialProfile.height || '',
        weight: initialProfile.weight || '',
    });
    const [otherAllergy, setOtherAllergy] = useState('');
    const [otherCondition, setOtherCondition] = useState('');

    const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
    
    const handleFinish = () => {
        const finalProfile = { 
            ...profileData,
            // Ensure height and weight are preserved even if empty strings
            height: profileData.height || initialProfile.height || '',
            weight: profileData.weight || initialProfile.weight || '',
        };
        if (otherAllergy.trim()) {
            finalProfile.allergies = [...new Set([...(finalProfile.allergies || []), otherAllergy.trim()])];
        }
        if (otherCondition.trim()) {
            finalProfile.chronicConditions = [...new Set([...(finalProfile.chronicConditions || []), otherCondition.trim()])];
        }
        onComplete(finalProfile);
    };

    const toggleSelection = (list: string[], item: string) => 
        list.includes(item) ? list.filter(i => i !== item) : [...list, item];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">What is your blood type?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {quizData.bloodTypes.map(type => (
                                <OptionButton 
                                    key={type}
                                    label={type}
                                    isSelected={profileData.bloodGroup === type}
                                    onClick={() => setProfileData({ ...profileData, bloodGroup: type })}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Your Vitals</h2>
                        <div className="space-y-4">
                             <input
                                type="number"
                                value={profileData.age || ''}
                                onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value, 10) || undefined})}
                                placeholder="Age (years)"
                                className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                             />
                              <input
                                type="text"
                                value={profileData.height || ''}
                                onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                                placeholder="Height (e.g., 180 cm or 5 feet 11 inches)"
                                className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                             />
                             <input
                                type="text"
                                value={profileData.weight || ''}
                                onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                                placeholder="Weight (e.g., 75 kg / 165 lbs)"
                                className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                             />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Do you have any allergies?</h2>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                             {quizData.commonAllergies.map(allergy => (
                                <OptionButton 
                                    key={allergy}
                                    label={allergy}
                                    isSelected={profileData.allergies.includes(allergy)}
                                    onClick={() => setProfileData({ ...profileData, allergies: toggleSelection(profileData.allergies, allergy) })}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            value={otherAllergy}
                            onChange={(e) => setOtherAllergy(e.target.value)}
                            placeholder="Other (e.g., Aspirin)"
                            className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                         />
                    </div>
                );
            case 4:
                 return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Any chronic conditions?</h2>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                             {quizData.commonConditions.map(condition => (
                                <OptionButton 
                                    key={condition}
                                    label={condition}
                                    isSelected={profileData.chronicConditions.includes(condition)}
                                    onClick={() => setProfileData({ ...profileData, chronicConditions: toggleSelection(profileData.chronicConditions, condition) })}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                             value={otherCondition}
                            onChange={(e) => setOtherCondition(e.target.value)}
                            placeholder="Other (e.g., Hypothyroidism)"
                            className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                         />
                    </div>
                );
            case 5:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Emergency Contact</h2>
                        <div className="space-y-4">
                             <input
                                type="text"
                                value={profileData.emergencyContact.name}
                                onChange={(e) => setProfileData({...profileData, emergencyContact: {...profileData.emergencyContact, name: e.target.value}})}
                                placeholder="Contact Name"
                                className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                             />
                              <input
                                type="tel"
                                value={profileData.emergencyContact.phone}
                                onChange={(e) => setProfileData({...profileData, emergencyContact: {...profileData.emergencyContact, phone: e.target.value}})}
                                placeholder="Contact Phone"
                                className="w-full p-3 border-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary outline-none text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
                             />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800">&times;</button>
                <ProgressBar current={step} total={TOTAL_STEPS} />
                
                <div className="my-6 min-h-[200px]">
                    {renderStepContent()}
                </div>
                
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleBack}
                        disabled={step === 1}
                        className="py-3 px-6 bg-neutral-200 text-neutral-700 font-semibold rounded-xl disabled:opacity-50"
                    >
                        Back
                    </button>
                    {step < TOTAL_STEPS ? (
                        <button onClick={handleNext} className="py-3 px-6 bg-primary text-white font-semibold rounded-xl">Next</button>
                    ) : (
                        <button onClick={handleFinish} className="py-3 px-6 bg-accent-green text-white font-semibold rounded-xl">Finish</button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};