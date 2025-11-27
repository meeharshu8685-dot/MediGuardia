import React, { useState, useEffect } from 'react';
import { BackArrowIcon, UserIcon, EmailIcon, LockIcon, GoogleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthScreenProps {
    onLoginSuccess: () => void;
    onBack?: () => void;
    initialMode?: 'login' | 'signup';
}

// Plant leaf pattern for top section
const PlantLeafTopPattern = () => (
    <div className="absolute top-0 left-0 w-full h-48 overflow-hidden">
        <svg className="absolute w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            <defs>
                <pattern id="topLeafPattern" x="0" y="0" width="200" height="150" patternUnits="userSpaceOnUse">
                    <path
                        d="M100,30 Q120,60 140,100 Q150,130 140,160 Q130,180 100,200 Q70,180 60,160 Q50,130 60,100 Q80,60 100,30 Z"
                        fill="#0d4a2e"
                        opacity="0.3"
                    />
                    <path
                        d="M100,30 Q120,60 140,100 Q150,130 140,160 Q130,180 100,200"
                        stroke="#1a5f3f"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.5"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#1a5f3f" />
            <rect width="100%" height="100%" fill="url(#topLeafPattern)" />
            {/* Large decorative leaves */}
            <path
                d="M50,50 Q80,70 100,110 Q110,150 100,190 Q90,210 50,230 Q10,210 0,190 Q-10,150 0,110 Q20,70 50,50 Z"
                fill="#0d4a2e"
                opacity="0.4"
            />
            <path
                d="M350,80 Q380,100 400,140 Q410,180 400,220 Q390,240 350,260 Q310,240 300,220 Q290,180 300,140 Q320,100 350,80 Z"
                fill="#0d4a2e"
                opacity="0.4"
            />
        </svg>
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-white rounded-t-[3rem]"></div>
    </div>
);

// Decorative leaf branch
const LeafBranch = () => (
    <div className="absolute right-0 top-32 opacity-30">
        <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M60 20 Q70 30 75 45 Q78 55 75 65 Q70 75 60 80 Q50 75 45 65 Q42 55 45 45 Q50 30 60 20 Z"
                fill="#1a5f3f"
            />
            <path
                d="M50 40 Q55 50 58 60 Q60 68 58 75 Q55 82 50 85 Q45 82 42 75 Q40 68 42 60 Q45 50 50 40 Z"
                fill="#1a5f3f"
            />
            <path
                d="M40 60 Q45 70 48 80 Q50 88 48 95 Q45 102 40 105 Q35 102 32 95 Q30 88 32 80 Q35 70 40 60 Z"
                fill="#1a5f3f"
            />
            <path
                d="M30 80 L35 100 L25 100 Z"
                fill="#1a5f3f"
            />
        </svg>
    </div>
);

const InputField: React.FC<{ 
    id: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    icon: React.ReactNode;
}> = ({ id, label, type, placeholder, value, onChange, error, icon }) => (
    <div className="mb-4">
        <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-neutral-500 w-5 h-5 flex items-center justify-center">
                {icon}
            </div>
        <input 
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                } rounded-xl focus:border-[#1a5f3f] focus:outline-none transition-colors text-gray-800 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500`}
            id={id} 
            type={type} 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
);

const LoginView: React.FC<{ setMode: (mode: AuthMode) => void; onLogin: () => void; onBack?: () => void }> = ({
    setMode,
    onLogin,
    onBack,
}) => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        setError('');
        setEmailError('');
        setPasswordError('');

        // Validation - accept email in the Full Name field
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }

        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            onLogin();
        } else {
            setError(result.error || 'Login failed. Please check your credentials.');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsGoogleLoading(true);
        const result = await loginWithGoogle();
        
        if (!result.success) {
            setIsGoogleLoading(false);
            setError(result.error || 'Google sign in failed');
        }
        // If success, OAuth will redirect - don't set loading to false
        // The redirect will happen and the app will handle the callback
    };

    return (
        <div className="relative min-h-screen w-screen bg-white">
            {/* Top curved section with plant pattern */}
            <div className="relative h-48">
                <PlantLeafTopPattern />
                <button
                    onClick={onBack || (() => setMode('login'))}
                    className="absolute top-6 left-6 z-20 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <BackArrowIcon />
                </button>
            </div>

            {/* Main content */}
            <div className="relative px-6 pt-8 pb-12">
                <div className="relative">
                    <LeafBranch />
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a5f3f] mb-2 tracking-tight">Welcome back</h2>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">Login to your account.</p>
            
            {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            <InputField 
                id="login-email" 
                        label=""
                type="email" 
                        placeholder="Email"
                value={email}
                onChange={setEmail}
                error={emailError}
                        icon={<EmailIcon />}
            />
            <InputField 
                id="login-password" 
                        label=""
                type="password" 
                        placeholder="Password"
                value={password}
                onChange={setPassword}
                error={passwordError}
                        icon={<LockIcon />}
            />

                    <div className="flex justify-between items-center text-sm mb-6">
                        <label className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                        type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-[#1a5f3f] focus:ring-[#1a5f3f] mr-2"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                            <span>Remember me</span>
                </label>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setMode('forgot');
                            }}
                            className="text-[#1a5f3f] font-medium hover:underline"
                        >
                            Forgot Password?
                        </a>
            </div>

            <button 
                onClick={handleLogin} 
                        disabled={isLoading || isGoogleLoading}
                        className="w-full bg-[#1a5f3f] text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-[#0d4a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
                        {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading || isGoogleLoading}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl text-base font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
                    >
                        {isGoogleLoading ? (
                            <span>Connecting...</span>
                        ) : (
                            <>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>
            
                    <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setMode('signup');
                            }}
                            className="text-[#1a5f3f] dark:text-emerald-400 font-semibold hover:underline"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const SignupView: React.FC<{ setMode: (mode: AuthMode) => void; onSignup: () => void; onBack?: () => void }> = ({
    setMode,
    onSignup,
    onBack,
}) => {
    const { signup, loginWithGoogle } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = async () => {
        setError('');
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validation
        if (!fullName.trim()) {
            setNameError('Full Name is required');
            return;
        }
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }
        if (!termsAccepted) {
            setTermsError('You must accept the Terms and Conditions to sign up');
            return;
        }

        setIsLoading(true);
        const result = await signup(fullName.trim(), email, password);
        setIsLoading(false);

        if (result.success) {
            onSignup();
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setTermsError('');
        
        if (!termsAccepted) {
            setTermsError('You must accept the Terms and Conditions to sign up');
            return;
        }
        
        setIsGoogleLoading(true);
        const result = await loginWithGoogle();
        
        if (!result.success) {
            setIsGoogleLoading(false);
            setError(result.error || 'Google sign up failed');
        }
        // If success, OAuth will redirect - don't set loading to false
        // The redirect will happen and the app will handle the callback
    };

    return (
        <div className="relative min-h-screen w-screen bg-white">
            {/* Top curved section with plant pattern */}
            <div className="relative h-48">
                <PlantLeafTopPattern />
                <button
                    onClick={onBack || (() => setMode('login'))}
                    className="absolute top-6 left-6 z-20 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <BackArrowIcon />
                </button>
            </div>

            {/* Main content */}
            <div className="relative px-6 pt-8 pb-12">
                <div className="relative">
                    <LeafBranch />
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a5f3f] mb-2 tracking-tight">Register</h2>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">Create your new account.</p>
            
            {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}
            
            <InputField 
                id="signup-name" 
                        label=""
                type="text" 
                        placeholder="Full Name"
                        value={fullName}
                        onChange={setFullName}
                error={nameError}
                        icon={<UserIcon />}
            />
            <InputField 
                id="signup-email" 
                        label=""
                type="email" 
                        placeholder="Email"
                value={email}
                onChange={setEmail}
                error={emailError}
                        icon={<EmailIcon />}
            />
            <InputField 
                id="signup-password" 
                        label=""
                type="password" 
                        placeholder="Password"
                value={password}
                onChange={setPassword}
                error={passwordError}
                        icon={<LockIcon />}
                    />
                    <InputField
                        id="signup-confirm-password"
                        label=""
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        error={confirmPasswordError}
                        icon={<LockIcon />}
                />

                    {/* Terms and Conditions Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-start text-sm cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-[#1a5f3f] focus:ring-[#1a5f3f] mr-3 mt-0.5 flex-shrink-0"
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    setTermsError('');
                                }}
                            />
                            <span className="text-gray-600">
                                I agree to the{' '}
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Navigate to terms screen or open modal
                                        alert('Terms and Conditions\n\nThis app is not a medical diagnosis tool. Please consult a healthcare professional for medical advice.\n\nBy using this app, you agree to use it responsibly and understand that it is for informational purposes only.');
                                    }}
                                    className="text-[#1a5f3f] font-semibold hover:underline"
                                >
                                    Terms and Conditions
                                </a>
                                {' '}and{' '}
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Navigate to privacy policy screen or open modal
                                        alert('Privacy Policy\n\nWe respect your privacy. Your medical data is stored securely and will only be used to provide you with health-related services.\n\nWe do not share your personal information with third parties without your consent.');
                                    }}
                                    className="text-[#1a5f3f] font-semibold hover:underline"
                                >
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                        {termsError && (
                            <p className="text-red-500 text-xs mt-1 ml-7">{termsError}</p>
                        )}
                    </div>
            
            <button 
                onClick={handleSignup} 
                        disabled={isLoading || isGoogleLoading || !termsAccepted}
                        className="w-full bg-[#1a5f3f] text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-[#0d4a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
                {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
            
                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Google Signup Button */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={isLoading || isGoogleLoading || !termsAccepted}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl text-base font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
                    >
                        {isGoogleLoading ? (
                            <span>Connecting...</span>
                        ) : (
                            <>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setMode('login');
                            }}
                            className="text-[#1a5f3f] dark:text-emerald-400 font-semibold hover:underline"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordView: React.FC<{ setMode: (mode: AuthMode) => void; onBack?: () => void }> = ({
    setMode,
    onBack,
}) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleReset = async () => {
        if (!email) {
            setMessage('Please enter your email');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setMessage('Password reset link has been sent to your email!');
    };

    return (
        <div className="relative min-h-screen w-screen bg-white">
            {/* Top curved section with plant pattern */}
            <div className="relative h-48">
                <PlantLeafTopPattern />
                <button
                    onClick={onBack || (() => setMode('login'))}
                    className="absolute top-6 left-6 z-20 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <BackArrowIcon />
                </button>
            </div>

            {/* Main content */}
            <div className="relative px-6 pt-8 pb-12">
                <div className="relative">
                    <LeafBranch />
                    <h2 className="text-3xl font-bold text-[#1a5f3f] mb-2">Forgot Password</h2>
                    <p className="text-gray-500 text-sm mb-8">Enter your email to receive a password reset link.</p>
            
            {message && (
                        <div
                            className={`px-4 py-3 rounded-lg text-sm mb-4 ${
                    message.includes('sent') 
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}
                        >
                    {message}
                </div>
            )}

            <InputField 
                id="forgot-email" 
                        label=""
                type="email" 
                        placeholder="Email"
                value={email}
                onChange={setEmail}
                        icon={<EmailIcon />}
            />
            
            <button 
                onClick={handleReset}
                disabled={isLoading}
                        className="w-full bg-[#1a5f3f] text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-[#0d4a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
                </div>
            </div>
        </div>
    );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onBack, initialMode = 'login' }) => {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    return (
        <>
            {mode === 'login' && <LoginView setMode={setMode} onLogin={onLoginSuccess} onBack={onBack} />}
            {mode === 'signup' && <SignupView setMode={setMode} onSignup={onLoginSuccess} onBack={onBack} />}
            {mode === 'forgot' && <ForgotPasswordView setMode={setMode} onBack={onBack} />}
        </>
    );
};
