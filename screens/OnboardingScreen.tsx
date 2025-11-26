
import React, { useState } from 'react';

const onboardingData = [
    {
        title: "Instant Symptom Checker",
        description: "Understand your health concerns instantly with our AI-powered symptom analysis.",
        image: "https://picsum.photos/seed/med1/400/300",
    },
    {
        title: "Emergency First Aid Guidance",
        description: "Access clear, step-by-step first aid instructions for common emergencies.",
        image: "https://picsum.photos/seed/med2/400/300",
    },
    {
        title: "Track Your Health & Documents",
        description: "Keep your medical history, medications, and documents organized in one secure place.",
        image: "https://picsum.photos/seed/med3/400/300",
    },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < onboardingData.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const { title, description, image } = onboardingData[currentStep];

    return (
        <div className="flex flex-col h-screen w-screen bg-[#ECF3FF] text-[#1A1A1A]">
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <div className="relative w-full max-w-sm h-64 bg-gradient-to-br from-[#4158F7] to-[#9DBBFF] rounded-2xl mb-12 shadow-lg">
                   <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-50"/>
                   <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                </div>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                <p className="text-lg text-gray-600 max-w-md">{description}</p>
            </div>

            <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                    {onboardingData.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full mx-1.5 transition-all duration-300 ${index === currentStep ? 'bg-[#3A59FF] w-6' : 'bg-gray-300'}`}
                        ></div>
                    ))}
                </div>
                <button
                    onClick={handleNext}
                    className="w-full bg-[#3A59FF] text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity"
                >
                    {currentStep === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                </button>
                <button
                    onClick={handleSkip}
                    className="w-full text-gray-500 py-3 mt-2 text-md font-medium"
                >
                    Skip
                </button>
            </div>
        </div>
    );
};
