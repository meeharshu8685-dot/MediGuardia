import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { saveMedicalProfile } from '../services/medicalProfileService';

// Supporting Components
const PrimaryButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}> = ({ onClick, disabled, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-4 px-6 bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white font-semibold text-lg rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${className}`}
    >
        <span>{children}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

const PillTag: React.FC<{
    label: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-full font-medium text-base transition-all duration-200 ${
            isSelected
                ? 'bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#4F9CF9]'
        }`}
    >
        {label}
    </button>
);

// Step 1: Age Selection
const StepAge: React.FC<{
    age: number | undefined;
    onAgeChange: (age: number) => void;
}> = ({ age, onAgeChange }) => {
    const [selectedAge, setSelectedAge] = useState(age || 25);
    const ages = Array.from({ length: 63 }, (_, i) => i + 18); // 18-80

    useEffect(() => {
        if (age) setSelectedAge(age);
    }, [age]);

    const handleAgeChange = (newAge: number) => {
        setSelectedAge(newAge);
        onAgeChange(newAge);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-8 text-center">Please tell us your current age</h2>
            <div className="w-full max-w-sm">
                <div className="relative h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                        div::-webkit-scrollbar { display: none; }
                    `}</style>
                    {ages.map((a) => (
                        <div
                            key={a}
                            onClick={() => handleAgeChange(a)}
                            className={`text-center py-4 cursor-pointer transition-all duration-200 ${
                                a === selectedAge
                                    ? 'text-[#4F9CF9] text-5xl font-bold scale-110'
                                    : a === selectedAge - 1 || a === selectedAge + 1
                                    ? 'text-gray-400 text-2xl'
                                    : 'text-gray-300 text-lg'
                            }`}
                        >
                            {a}
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-8 py-4">
                        <div className="text-6xl font-bold text-[#4F9CF9]">{selectedAge}</div>
                        <div className="text-sm text-gray-600 mt-2">years old</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 2: Role Selection
const StepRole: React.FC<{
    role: string | undefined;
    onRoleChange: (role: string) => void;
}> = ({ role, onRoleChange }) => {
    const roles = [
        { id: 'patient', label: 'I am a Patient', icon: '👤', color: 'from-[#E9FDF8] to-[#E0F2FE]' },
        { id: 'doctor', label: 'I am a Doctor', icon: '👨‍⚕️', color: 'from-[#F3E8FF] to-[#E9D5FF]' },
        { id: 'provider', label: 'I am a Healthcare Provider', icon: '🏥', color: 'from-[#FEF3C7] to-[#FDE68A]' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-12 text-center">Are you a doctor, patient, or provider?</h2>
            <div className="w-full max-w-md space-y-4">
                {roles.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => onRoleChange(r.id)}
                        className={`w-full p-6 rounded-[30px] shadow-md transition-all duration-300 ${
                            role === r.id
                                ? `bg-gradient-to-r ${r.color} border-4 border-[#4F9CF9] scale-105`
                                : 'bg-white border-2 border-gray-200 hover:border-[#4F9CF9]'
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">{r.icon}</div>
                            <span className="text-lg font-semibold text-gray-900">{r.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Step 3: Health Rating (Arc Slider)
const StepHealthRating: React.FC<{
    healthRating: number | undefined;
    onRatingChange: (rating: number) => void;
}> = ({ healthRating, onRatingChange }) => {
    const [rating, setRating] = useState(healthRating || 3);
    const ratings = [
        { value: 1, label: 'Low', subtitle: '1-2hr daily' },
        { value: 2, label: 'Moderate', subtitle: '2-3hr daily' },
        { value: 3, label: 'Good', subtitle: '3-5hr daily' },
        { value: 4, label: 'Very Good', subtitle: '5-7hr daily' },
        { value: 5, label: 'Excellent', subtitle: '7+hr daily' },
    ];

    useEffect(() => {
        if (healthRating) setRating(healthRating);
    }, [healthRating]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRating = parseInt(e.target.value);
        setRating(newRating);
        onRatingChange(newRating);
    };

    const currentRating = ratings.find(r => r.value === rating) || ratings[2];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-12 text-center">How would you rate your general health?</h2>
            <div className="w-full max-w-md">
                <div className="relative mb-8">
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={handleSliderChange}
                        className="w-full h-3 bg-gradient-to-r from-[#E9FDF8] via-[#E0F2FE] to-[#F3E8FF] rounded-full appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #4F9CF9 0%, #4F9CF9 ${((rating - 1) / 4) * 100}%, #E0F2FE ${((rating - 1) / 4) * 100}%, #E0F2FE 100%)`
                        }}
                    />
                    <style>{`
                        .slider::-webkit-slider-thumb {
                            appearance: none;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background: #4F9CF9;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(79, 156, 249, 0.4);
                        }
                        .slider::-moz-range-thumb {
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background: #4F9CF9;
                            cursor: pointer;
                            border: none;
                            box-shadow: 0 4px 12px rgba(79, 156, 249, 0.4);
                        }
                    `}</style>
                </div>
                <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-10 py-6">
                        <div className="text-7xl font-bold text-[#4F9CF9] mb-2">{rating}</div>
                        <div className="text-xl font-semibold text-gray-900 mb-1">{currentRating.label}</div>
                        <div className="text-sm text-gray-600">{currentRating.subtitle}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 4: Medical Conditions
const StepConditions: React.FC<{
    conditions: string[];
    onConditionsChange: (conditions: string[]) => void;
}> = ({ conditions, onConditionsChange }) => {
    const commonConditions = [
        'Diabetes', 'Asthma', 'Thyroid', 'BP High', 'Heart Disease', 'Anxiety', 'Depression',
        'Arthritis', 'Hypertension', 'OCD', 'GERD', 'Carpal Tunnel', 'Stroke', 'Alzheimer', 'None'
    ];

    const handleToggle = (condition: string) => {
        if (condition === 'None') {
            onConditionsChange([]);
        } else {
            const newConditions = conditions.includes(condition)
                ? conditions.filter(c => c !== condition)
                : [...conditions.filter(c => c !== 'None'), condition];
            onConditionsChange(newConditions);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-8">
            <h2 className="text-[28px] font-bold text-gray-900 mb-8 text-center">Please select your medical conditions</h2>
            <div className="w-full max-w-2xl">
                <div className="flex flex-wrap gap-3 justify-center">
                    {commonConditions.map((condition) => {
                        const isSelected = condition === 'None' 
                            ? conditions.length === 0 
                            : conditions.includes(condition);
                        return (
                            <PillTag
                                key={condition}
                                label={condition}
                                isSelected={isSelected}
                                onClick={() => handleToggle(condition)}
                            />
                        );
                    })}
                </div>
                {conditions.length > 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">Selected: {conditions.join(', ')}</p>
                    </div>
                )}
                {conditions.length === 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">No conditions selected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 5: Height Selection
const StepHeight: React.FC<{
    height: string | undefined;
    onHeightChange: (height: string) => void;
}> = ({ height, onHeightChange }) => {
    const [selectedHeight, setSelectedHeight] = useState(height || '');
    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    
    // Height options: 120-220 cm or 4'0" - 7'2"
    const heightsCm = Array.from({ length: 101 }, (_, i) => i + 120); // 120-220 cm
    const heightsFt = Array.from({ length: 39 }, (_, i) => {
        const feet = Math.floor((i + 48) / 12); // 4-7 feet
        const inches = (i + 48) % 12;
        return { feet, inches, display: `${feet}'${inches}"` };
    });

    useEffect(() => {
        if (height) {
            setSelectedHeight(height);
            // Detect unit from height string
            if (height.includes("'") || height.includes('"')) {
                setUnit('ft');
            } else {
                setUnit('cm');
            }
        }
    }, [height]);

    const handleHeightChange = (newHeight: string) => {
        setSelectedHeight(newHeight);
        onHeightChange(newHeight);
    };

    const handleUnitToggle = (newUnit: 'cm' | 'ft') => {
        setUnit(newUnit);
        setSelectedHeight(''); // Reset when switching units
        onHeightChange('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-8 text-center">What is your height?</h2>
            
            {/* Unit Toggle */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => handleUnitToggle('cm')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        unit === 'cm'
                            ? 'bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                >
                    cm
                </button>
                <button
                    onClick={() => handleUnitToggle('ft')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        unit === 'ft'
                            ? 'bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                >
                    ft/in
                </button>
            </div>

            {unit === 'cm' ? (
                <div className="w-full max-w-sm">
                    <div className="relative h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`
                            div::-webkit-scrollbar { display: none; }
                        `}</style>
                        {heightsCm.map((h) => (
                            <div
                                key={h}
                                onClick={() => handleHeightChange(`${h} cm`)}
                                className={`text-center py-4 cursor-pointer transition-all duration-200 ${
                                    selectedHeight === `${h} cm`
                                        ? 'text-[#4F9CF9] text-5xl font-bold scale-110'
                                        : selectedHeight === `${h - 1} cm` || selectedHeight === `${h + 1} cm`
                                        ? 'text-gray-400 text-2xl'
                                        : 'text-gray-300 text-lg'
                                }`}
                            >
                                {h}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-8 py-4">
                            <div className="text-6xl font-bold text-[#4F9CF9]">{selectedHeight || '--'}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-sm">
                    <div className="relative h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`
                            div::-webkit-scrollbar { display: none; }
                        `}</style>
                        {heightsFt.map((h, idx) => {
                            const heightStr = h.display;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleHeightChange(heightStr)}
                                    className={`text-center py-4 cursor-pointer transition-all duration-200 ${
                                        selectedHeight === heightStr
                                            ? 'text-[#4F9CF9] text-5xl font-bold scale-110'
                                            : selectedHeight === heightsFt[idx - 1]?.display || selectedHeight === heightsFt[idx + 1]?.display
                                            ? 'text-gray-400 text-2xl'
                                            : 'text-gray-300 text-lg'
                                    }`}
                                >
                                    {heightStr}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 text-center">
                        <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-8 py-4">
                            <div className="text-6xl font-bold text-[#4F9CF9]">{selectedHeight || '--'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Step 6: Weight Selection
const StepWeight: React.FC<{
    weight: string | undefined;
    onWeightChange: (weight: string) => void;
}> = ({ weight, onWeightChange }) => {
    const [selectedWeight, setSelectedWeight] = useState(weight || '');
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    
    // Weight options: 30-150 kg or 66-330 lbs
    const weightsKg = Array.from({ length: 121 }, (_, i) => i + 30); // 30-150 kg
    const weightsLbs = Array.from({ length: 265 }, (_, i) => i + 66); // 66-330 lbs

    useEffect(() => {
        if (weight) {
            setSelectedWeight(weight);
            // Detect unit from weight string
            if (weight.includes('lbs') || weight.includes('lb')) {
                setUnit('lbs');
            } else {
                setUnit('kg');
            }
        }
    }, [weight]);

    const handleWeightChange = (newWeight: string) => {
        setSelectedWeight(newWeight);
        onWeightChange(newWeight);
    };

    const handleUnitToggle = (newUnit: 'kg' | 'lbs') => {
        setUnit(newUnit);
        setSelectedWeight(''); // Reset when switching units
        onWeightChange('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-8 text-center">What is your weight?</h2>
            
            {/* Unit Toggle */}
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => handleUnitToggle('kg')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        unit === 'kg'
                            ? 'bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                >
                    kg
                </button>
                <button
                    onClick={() => handleUnitToggle('lbs')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        unit === 'lbs'
                            ? 'bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200'
                    }`}
                >
                    lbs
                </button>
            </div>

            {unit === 'kg' ? (
                <div className="w-full max-w-sm">
                    <div className="relative h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`
                            div::-webkit-scrollbar { display: none; }
                        `}</style>
                        {weightsKg.map((w) => (
                            <div
                                key={w}
                                onClick={() => handleWeightChange(`${w} kg`)}
                                className={`text-center py-4 cursor-pointer transition-all duration-200 ${
                                    selectedWeight === `${w} kg`
                                        ? 'text-[#4F9CF9] text-5xl font-bold scale-110'
                                        : selectedWeight === `${w - 1} kg` || selectedWeight === `${w + 1} kg`
                                        ? 'text-gray-400 text-2xl'
                                        : 'text-gray-300 text-lg'
                                }`}
                            >
                                {w}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-8 py-4">
                            <div className="text-6xl font-bold text-[#4F9CF9]">{selectedWeight || '--'}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-sm">
                    <div className="relative h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`
                            div::-webkit-scrollbar { display: none; }
                        `}</style>
                        {weightsLbs.map((w) => (
                            <div
                                key={w}
                                onClick={() => handleWeightChange(`${w} lbs`)}
                                className={`text-center py-4 cursor-pointer transition-all duration-200 ${
                                    selectedWeight === `${w} lbs`
                                        ? 'text-[#4F9CF9] text-5xl font-bold scale-110'
                                        : selectedWeight === `${w - 1} lbs` || selectedWeight === `${w + 1} lbs`
                                        ? 'text-gray-400 text-2xl'
                                        : 'text-gray-300 text-lg'
                                }`}
                            >
                                {w}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <div className="inline-block bg-gradient-to-r from-[#E9FDF8] to-[#E0F2FE] rounded-[30px] px-8 py-4">
                            <div className="text-6xl font-bold text-[#4F9CF9]">{selectedWeight || '--'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Step 7: Emergency Contact
const StepEmergencyContact: React.FC<{
    emergencyContact: { name: string; phone: string };
    onContactChange: (contact: { name: string; phone: string }) => void;
}> = ({ emergencyContact, onContactChange }) => {
    const [name, setName] = useState(emergencyContact?.name || '');
    const [phone, setPhone] = useState(emergencyContact?.phone || '');

    useEffect(() => {
        onContactChange({ name, phone });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, phone]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <h2 className="text-[28px] font-bold text-gray-900 mb-12 text-center">Add an emergency contact</h2>
            <div className="w-full max-w-md space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full p-4 bg-white rounded-[22px] border-2 border-gray-200 focus:border-[#4F9CF9] focus:ring-2 focus:ring-[#4F9CF9]/20 outline-none transition text-lg text-gray-900 placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full p-4 bg-white rounded-[22px] border-2 border-gray-200 focus:border-[#4F9CF9] focus:ring-2 focus:ring-[#4F9CF9]/20 outline-none transition text-lg text-gray-900 placeholder-gray-400"
                    />
                </div>
            </div>
        </div>
    );
};

// Step 8: Summary
const StepSummary: React.FC<{
    profileData: ProfileSetupData;
}> = ({ profileData }) => {
    const roleLabels: { [key: string]: string } = {
        patient: 'Patient',
        doctor: 'Doctor',
        provider: 'Healthcare Provider',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-8">
            <h2 className="text-[28px] font-bold text-gray-900 mb-8 text-center">Review Your Profile</h2>
            <div className="w-full max-w-md bg-white rounded-[30px] p-8 shadow-lg">
                <div className="space-y-4">
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Age</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData.age} years</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Height</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData.height || 'Not set'}</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData.weight || 'Not set'}</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Role</p>
                        <p className="text-lg font-semibold text-gray-900">{roleLabels[profileData.role] || 'Not set'}</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Health Rating</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData.healthRating}/5</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Medical Conditions</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {profileData.conditions.length > 0 ? profileData.conditions.join(', ') : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                        <p className="text-lg font-semibold text-gray-900">{profileData.emergencyContact.name || 'Not set'}</p>
                        <p className="text-sm text-gray-600">{profileData.emergencyContact.phone || ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Profile Setup Data Interface
export interface ProfileSetupData {
    age: number;
    height: string;
    weight: string;
    role: string;
    healthRating: number;
    conditions: string[];
    emergencyContact: {
        name: string;
        phone: string;
    };
}

interface ProfileSetupScreenProps {
    initialProfile?: UserProfile;
    onComplete: (profile: UserProfile) => void;
    onClose?: () => void;
    isEditMode?: boolean;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
    initialProfile,
    onComplete,
    onClose,
    isEditMode = false,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 8;

    // Load role and healthRating from localStorage if available
    const loadStoredData = () => {
        const storedRole = localStorage.getItem('userRole');
        const storedHealthRating = localStorage.getItem('userHealthRating');
        return {
            role: storedRole || 'patient',
            healthRating: storedHealthRating ? parseInt(storedHealthRating, 10) : 3,
        };
    };

    const storedData = loadStoredData();

    const [profileData, setProfileData] = useState<ProfileSetupData>({
        age: initialProfile?.age || 25,
        height: initialProfile?.height || '',
        weight: initialProfile?.weight || '',
        role: storedData.role,
        healthRating: storedData.healthRating,
        conditions: initialProfile?.chronicConditions || [],
        emergencyContact: initialProfile?.emergencyContact || { name: '', phone: '' },
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else if (onClose) {
            onClose();
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Convert profileData to UserProfile format
            const updatedProfile: UserProfile = {
                ...(initialProfile || {
                    name: '',
                    email: '',
                    avatarUrl: '',
                    allergies: [],
                    chronicConditions: [],
                    emergencyContact: { name: '', phone: '' }
                }),
                age: profileData.age,
                height: profileData.height || undefined,
                weight: profileData.weight || undefined,
                chronicConditions: profileData.conditions,
                emergencyContact: profileData.emergencyContact,
            };

            // Save to Supabase
            const profilePayload = {
                full_name: initialProfile?.name || 'User',
                age: profileData.age || null,
                height: profileData.height || null,
                weight: profileData.weight || null,
                chronic_conditions: profileData.conditions || [],
                emergency_contact_name: profileData.emergencyContact?.name || null,
                emergency_contact_phone: profileData.emergencyContact?.phone || null,
            };

            const result = await saveMedicalProfile(profilePayload);

            if (result.success) {
                // Store role and healthRating in localStorage
                localStorage.setItem('userRole', profileData.role);
                localStorage.setItem('userHealthRating', profileData.healthRating.toString());
                onComplete(updatedProfile);
            } else {
                console.error('Failed to save profile:', result.error);
                const errorMessage = result.error || 'Failed to save profile. Please try again.';
                alert(`Failed to save profile: ${errorMessage}\n\nPlease check:\n1. Your internet connection\n2. Database permissions\n3. Try again in a moment`);
            }
        } catch (error: any) {
            console.error('Error saving profile:', error);
            const errorMessage = error?.message || 'An unexpected error occurred while saving your profile.';
            alert(`Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
        } finally {
            setIsSaving(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return profileData.age >= 18 && profileData.age <= 80;
            case 2:
                return !!profileData.height;
            case 3:
                return !!profileData.weight;
            case 4:
                return !!profileData.role;
            case 5:
                return profileData.healthRating >= 1 && profileData.healthRating <= 5;
            case 6:
                return true; // Conditions are optional
            case 7:
                return !!profileData.emergencyContact.name && !!profileData.emergencyContact.phone;
            case 8:
                return true;
            default:
                return false;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepAge
                        age={profileData.age}
                        onAgeChange={(age) => setProfileData({ ...profileData, age })}
                    />
                );
            case 2:
                return (
                    <StepHeight
                        height={profileData.height}
                        onHeightChange={(height) => setProfileData({ ...profileData, height })}
                    />
                );
            case 3:
                return (
                    <StepWeight
                        weight={profileData.weight}
                        onWeightChange={(weight) => setProfileData({ ...profileData, weight })}
                    />
                );
            case 4:
                return (
                    <StepRole
                        role={profileData.role}
                        onRoleChange={(role) => setProfileData({ ...profileData, role })}
                    />
                );
            case 5:
                return (
                    <StepHealthRating
                        healthRating={profileData.healthRating}
                        onRatingChange={(rating) => setProfileData({ ...profileData, healthRating: rating })}
                    />
                );
            case 6:
                return (
                    <StepConditions
                        conditions={profileData.conditions}
                        onConditionsChange={(conditions) => setProfileData({ ...profileData, conditions })}
                    />
                );
            case 7:
                return (
                    <StepEmergencyContact
                        emergencyContact={profileData.emergencyContact}
                        onContactChange={(contact) => setProfileData({ ...profileData, emergencyContact: contact })}
                    />
                );
            case 8:
                return <StepSummary profileData={profileData} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#E9FDF8] to-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200/50">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#4F9CF9] to-[#6B7AE5] transition-all duration-300"
                                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{currentStep}/{TOTAL_STEPS}</span>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Skip
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
                {renderStep()}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 p-6">
                {currentStep === TOTAL_STEPS ? (
                    <PrimaryButton onClick={handleSave} disabled={isSaving || !canProceed()}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </PrimaryButton>
                ) : (
                    <PrimaryButton onClick={handleNext} disabled={!canProceed()}>
                        Continue
                    </PrimaryButton>
                )}
            </div>
        </div>
    );
};

