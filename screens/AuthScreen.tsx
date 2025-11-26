import React, { useState } from 'react';
// FIX: Import `ChevronRightIcon` to resolve reference error.
import { GoogleIcon, BackArrowIcon, FacebookIcon, ChevronRightIcon } from '../constants';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthScreenProps {
    onLoginSuccess: () => void;
}

const AuthBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <svg className="absolute w-[160%] h-[160%] -top-[30%] -left-[30%]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 800">
            <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4158F7', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#9DBBFF', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path fill="url(#authGradient)" opacity="0.6" d="M-12.5,433.5 C99.5,524 213.5,548 381,493 C548.5,438 625,317 625,317 L625,0 L-1,0 L-12.5,433.5 Z" />
            <path fill="url(#authGradient)" opacity="0.3" d="M-18,482 C116.4,567.2 313.4,582.8 450,517 C586.6,451.2 625,335 625,335 L625,0 L-1,0 L-18,482 Z" />
            <circle cx="100" cy="650" r="80" fill="#3A59FF" opacity="0.8" />
            <circle cx="500" cy="150" r="50" fill="white" opacity="0.9" />
            <circle cx="550" cy="700" r="100" fill="#4158F7" opacity="0.6" />
            <circle cx="80" cy="120" r="40" fill="white" opacity="0.7" />
        </svg>
    </div>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center space-x-2 text-sm font-medium text-white bg-[#3A59FF]/80 hover:bg-[#3A59FF] px-3 py-1.5 rounded-full mb-6">
        <div className="w-4 h-4 transform scale-x-[-1]"><ChevronRightIcon /></div>
        <span>Back</span>
    </button>
);

const SocialIcons: React.FC = () => (
    <div className="flex justify-center space-x-4">
        {[<GoogleIcon />, <FacebookIcon />].map((Icon, i) => (
            <button key={i} className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
                {Icon}
            </button>
        ))}
    </div>
);

const InputField: React.FC<{ id: string, label: string, type: string, placeholder: string }> = ({ id, label, type, placeholder }) => (
    <div className="mb-4">
        <label className="block text-gray-500 text-sm font-bold mb-2" htmlFor={id}>
            {label}
        </label>
        <input className="w-full px-4 py-3 bg-gray-100 rounded-lg border-2 border-transparent focus:border-[#3A59FF] focus:bg-white outline-none transition-colors text-[#1A1A1A]" id={id} type={type} placeholder={placeholder} />
    </div>
);

const LoginView: React.FC<{ setMode: (mode: AuthMode) => void; onLogin: () => void }> = ({ setMode, onLogin }) => {
    return (
        <div className="space-y-6">
             <BackButton onClick={() => alert("Navigate to previous screen")} />
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Welcome back</h2>
            
            <InputField id="login-email" label="Email" type="email" placeholder="kristin.watson@example.com" />
            <InputField id="login-password" label="Password" type="password" placeholder="••••••••••" />

            <div className="flex justify-between items-center text-sm">
                <label className="flex items-center text-gray-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#3A59FF] focus:ring-[#3A59FF]" defaultChecked />
                    <span className="ml-2">Remember me</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }} className="font-medium text-[#3A59FF] hover:underline">Forgot password?</a>
            </div>

            <button onClick={onLogin} className="w-full bg-[#3A59FF] text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity">Sign In</button>
            
            <div className="my-4 flex items-center">
                <hr className="flex-grow border-gray-200" />
                <span className="mx-4 text-gray-500 text-xs">Sign in with</span>
                <hr className="flex-grow border-gray-200" />
            </div>
            
            <SocialIcons />
            
            <p className="mt-6 text-center text-sm text-gray-600">
                Don’t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} className="font-bold text-[#3A59FF] hover:underline">Sign up</a>
            </p>
        </div>
    );
};

const SignupView: React.FC<{ setMode: (mode: AuthMode) => void; onSignup: () => void }> = ({ setMode, onSignup }) => {
    return (
        <div className="space-y-6">
            <BackButton onClick={() => setMode('login')} />
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Get Started</h2>
            
            <InputField id="signup-name" label="Full Name" type="text" placeholder="Enter Full Name" />
            <InputField id="signup-email" label="Email" type="email" placeholder="Enter Email" />
            <InputField id="signup-password" label="Password" type="password" placeholder="••••••••••" />
            
             <label className="flex items-start text-gray-600 text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#3A59FF] focus:ring-[#3A59FF] mt-1" defaultChecked />
                <span className="ml-2">I agree to the processing of <a href="#" className="font-bold text-[#3A59FF]">Personal data</a></span>
            </label>
            
            <button onClick={onSignup} className="w-full bg-[#3A59FF] text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity">Sign Up</button>
            
             <div className="my-4 flex items-center">
                <hr className="flex-grow border-gray-200" />
                <span className="mx-4 text-gray-500 text-xs">Sign up with</span>
                <hr className="flex-grow border-gray-200" />
            </div>

            <SocialIcons />

            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} className="font-bold text-[#3A59FF] hover:underline">Sign in</a>
            </p>
        </div>
    );
};

const ForgotPasswordView: React.FC<{ setMode: (mode: AuthMode) => void }> = ({ setMode }) => {
    return (
        <div className="space-y-6">
             <BackButton onClick={() => setMode('login')} />
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Forgot Password</h2>
            <p className="text-gray-500">Enter your email to receive a password reset link.</p>
            
            <InputField id="forgot-email" label="Email" type="email" placeholder="Enter your email" />
            
            <button className="w-full bg-[#3A59FF] text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity mt-4">Send Reset Link</button>
        </div>
    );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');

    return (
        <div className="relative min-h-screen w-screen bg-[#ECF3FF] flex flex-col items-center justify-center p-4 overflow-hidden">
            <AuthBackground />
            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
                    {mode === 'login' && <LoginView setMode={setMode} onLogin={onLoginSuccess} />}
                    {mode === 'signup' && <SignupView setMode={setMode} onSignup={onLoginSuccess} />}
                    {mode === 'forgot' && <ForgotPasswordView setMode={setMode} />}
                </div>
            </div>
        </div>
    );
};