import React from 'react';

interface WelcomeScreenProps {
    onSignUp: () => void;
    onLogin: () => void;
}

// Plant leaf pattern SVG component
const PlantLeafPattern = () => (
    <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
            <defs>
                <pattern id="leafPattern" x="0" y="0" width="200" height="300" patternUnits="userSpaceOnUse">
                    <path
                        d="M100,50 Q120,80 140,120 Q150,150 140,180 Q130,200 100,220 Q70,200 60,180 Q50,150 60,120 Q80,80 100,50 Z"
                        fill="#0d4a2e"
                        opacity="0.3"
                    />
                    <path
                        d="M100,50 Q120,80 140,120 Q150,150 140,180 Q130,200 100,220"
                        stroke="#1a5f3f"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.5"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#1a5f3f" />
            <rect width="100%" height="100%" fill="url(#leafPattern)" />
            {/* Large decorative leaves */}
            <path
                d="M50,100 Q80,120 100,160 Q110,200 100,240 Q90,260 50,280 Q10,260 0,240 Q-10,200 0,160 Q20,120 50,100 Z"
                fill="#0d4a2e"
                opacity="0.4"
            />
            <path
                d="M350,200 Q380,220 400,260 Q410,300 400,340 Q390,360 350,380 Q310,360 300,340 Q290,300 300,260 Q320,220 350,200 Z"
                fill="#0d4a2e"
                opacity="0.4"
            />
            <path
                d="M100,400 Q130,420 150,460 Q160,500 150,540 Q140,560 100,580 Q60,560 50,540 Q40,500 50,460 Q70,420 100,400 Z"
                fill="#0d4a2e"
                opacity="0.3"
            />
            <path
                d="M300,500 Q330,520 350,560 Q360,600 350,640 Q340,660 300,680 Q260,660 250,640 Q240,600 250,560 Q270,520 300,500 Z"
                fill="#0d4a2e"
                opacity="0.3"
            />
        </svg>
    </div>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignUp, onLogin }) => {
    return (
        <div className="relative min-h-screen w-screen bg-[#1a5f3f] flex flex-col items-center justify-center p-6 overflow-hidden">
            <PlantLeafPattern />
            
            {/* Main content */}
            <div className="relative z-10 flex flex-col items-start justify-center flex-grow w-full max-w-md px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                    The best app<br />for your health
                </h1>
            </div>

            {/* Buttons */}
            <div className="relative z-10 w-full max-w-md px-6 pb-12 space-y-4">
                <button
                    onClick={onSignUp}
                    className="w-full bg-white border-2 border-[#1a5f3f] text-[#1a5f3f] py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
                >
                    Sign up
                </button>
                <button
                    onClick={onLogin}
                    className="w-full bg-[#1a5f3f] border-2 border-[#1a5f3f] text-white py-4 rounded-2xl text-lg font-semibold hover:bg-[#0d4a2e] transition-colors shadow-lg"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

