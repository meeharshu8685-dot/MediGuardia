
import React, { useState, useRef } from 'react';
import { UserProfile, MedicalDocument } from '../types';
import { ChevronRightIcon, PdfFileIcon, ImageFileIcon, PencilIcon, PhoneIcon } from '../constants';
import { MedicalQuizScreen } from './MedicalQuizScreen';

const EditProfileModal: React.FC<{
    user: UserProfile;
    onClose: () => void;
    onSave: (updatedProfile: UserProfile) => void;
}> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave({ ...user, name, avatarUrl });
        onClose();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center text-neutral-800">Edit Profile</h2>
                
                <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                        <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-primary text-sm">Change Photo</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full p-3 border-2 rounded-xl bg-neutral-100 border-neutral-200 focus:border-primary outline-none"
                         />
                    </div>
                </div>
                
                <div className="flex items-center justify-end mt-8 space-x-3">
                    <button onClick={onClose} className="py-3 px-6 bg-neutral-200 text-neutral-700 font-semibold rounded-xl">Cancel</button>
                    <button onClick={handleSave} className="py-3 px-6 bg-primary text-white font-semibold rounded-xl">Save Changes</button>
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

const GetDocIcon: React.FC<{ type: MedicalDocument['type'] }> = ({ type }) => {
    switch (type) {
        case 'pdf': return <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><PdfFileIcon /></div>;
        case 'jpg':
        case 'png': return <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><ImageFileIcon /></div>;
        default: return <div className="w-10 h-10 bg-neutral-200 text-neutral-600 rounded-lg flex items-center justify-center">?</div>;
    }
};

const DocumentPreviewModal: React.FC<{ doc: MedicalDocument; onClose: () => void }> = ({ doc, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-4 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full text-neutral-800 flex items-center justify-center shadow-lg">&times;</button>
                <div className="p-4">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{doc.name}</h3>
                    <p className="text-sm text-neutral-500 mb-4">Uploaded: {doc.uploadDate}</p>
                    <div className="bg-neutral-100 rounded-2xl h-[60vh] flex items-center justify-center overflow-hidden">
                        {(doc.type === 'jpg' || doc.type === 'png') ? (
                            <img src={doc.previewUrl} alt={`Preview of ${doc.name}`} className="object-contain h-full w-full" />
                        ) : (
                            <div className="text-center text-neutral-500">
                                <div className="w-24 h-24 mx-auto text-red-400"><PdfFileIcon /></div>
                                <p className="mt-4 font-semibold">PDF Preview Unavailable</p>
                                <p className="text-sm">This document would open in a PDF viewer.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileHeader: React.FC<{ user: UserProfile, onEdit: () => void }> = ({ user, onEdit }) => (
    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 pt-16 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                <div className="ml-5">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">{user.email}</p>
                </div>
            </div>
            <button onClick={onEdit} className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                <div className="w-6 h-6 text-neutral-600 dark:text-neutral-300"><PencilIcon /></div>
            </button>
        </div>
    </div>
);

const ProfileInfoCard: React.FC<{ user: UserProfile, onEdit: () => void }> = ({ user, onEdit }) => (
    <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Medical Info</h3>
            <button onClick={onEdit} className="flex items-center space-x-2 text-sm font-semibold text-primary dark:text-primary-light bg-primary-light dark:bg-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <div className="w-4 h-4"><PencilIcon /></div>
                <span>Edit</span>
            </button>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Age</span><span className="font-semibold text-neutral-700 dark:text-neutral-200">{user.age ? `${user.age} years` : 'N/A'}</span></div>
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Height</span><span className="font-semibold text-neutral-700 dark:text-neutral-200">{user.height || 'N/A'}</span></div>
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Weight</span><span className="font-semibold text-neutral-700 dark:text-neutral-200">{user.weight || 'N/A'}</span></div>
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Blood Group</span><span className="font-semibold text-neutral-700 dark:text-neutral-200">{user.bloodGroup || 'N/A'}</span></div>
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Allergies</span><span className="font-semibold text-neutral-700 dark:text-neutral-200 text-right truncate">{user.allergies.length > 0 ? user.allergies.join(', ') : 'None'}</span></div>
            <div className="flex justify-between text-md"><span className="text-neutral-500 dark:text-neutral-400">Conditions</span><span className="font-semibold text-neutral-700 dark:text-neutral-200 text-right truncate">{user.chronicConditions.length > 0 ? user.chronicConditions.join(', ') : 'None'}</span></div>
            {user.emergencyContact && (
                <div className="pt-3 mt-3 border-t dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-500 dark:text-neutral-400">Emergency Contact</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-neutral-700 dark:text-neutral-200">{user.emergencyContact.name}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.emergencyContact.phone}</p>
                        </div>
                        <a
                            href={`tel:${user.emergencyContact.phone.replace(/[^0-9]/g, '')}`}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold flex items-center space-x-2 text-sm shadow-md hover:shadow-lg transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Call</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const DocumentList: React.FC<{ 
    docs: MedicalDocument[], 
    onPreview: (doc: MedicalDocument) => void;
    onUpload?: () => void;
}> = ({ docs, onPreview, onUpload }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        if (onUpload) {
            onUpload();
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In production, upload to Firebase Storage
            alert(`File selected: ${file.name}\n\nUpload functionality will save to Firebase Storage.\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">Documents</h3>
                <button 
                    onClick={handleUploadClick}
                    className="text-sm font-semibold text-primary dark:text-primary-light hover:underline"
                >
                    Upload
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        <div className="space-y-3">
            {docs.map(doc => (
                <div key={doc.id} onClick={() => onPreview(doc)} className="flex items-center p-3 bg-neutral-100 dark:bg-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                    <div className="mr-4 flex-shrink-0"><GetDocIcon type={doc.type} /></div>
                    <div className="flex-grow">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">{doc.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{doc.uploadDate}</p>
                    </div>
                    <div className="text-neutral-400 dark:text-neutral-500"><ChevronRightIcon /></div>
                </div>
            ))}
        </div>
        </div>
    );
};

const SettingsMenu: React.FC<{ onLogout: () => void; navigate: (view: string) => void }> = ({ onLogout, navigate }) => {
    const menuItems = [
        { 
            id: 'language', 
            label: 'Language', 
            action: () => {
                alert('Language selection coming soon!\n\nSupported languages:\n- English\n- Spanish\n- French\n- Hindi');
            }, 
            showIcon: false 
        },
        { 
            id: 'privacy', 
            label: 'Privacy & Permissions', 
            action: () => {
                alert('Privacy & Permissions\n\nManage your data privacy settings:\n- Location access\n- Health data sharing\n- Analytics preferences\n\nFeature coming soon!');
            }, 
            showIcon: false 
        },
        { id: 'subscription', label: 'Subscription Plan', action: () => navigate('subscription_coming_soon'), showIcon: false },
    ];
    
    return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-3xl shadow-sm">
            {menuItems.map(item => (
                <div 
                    key={item.id} 
                    onClick={item.action} 
                    className="flex justify-between items-center p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl cursor-pointer transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        {item.showIcon && (
                            <div className="w-5 h-5 text-primary dark:text-primary-light">
                                {item.icon}
                            </div>
                        )}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.label}</span>
                    </div>
                    <div className="text-neutral-400 dark:text-neutral-500"><ChevronRightIcon /></div>
                </div>
            ))}
             <div 
                onClick={onLogout} 
                className="flex justify-between items-center p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl cursor-pointer text-accent-red transition-colors"
            >
                <span className="font-medium">Logout</span>
            </div>
        </div>
    );
};

interface ProfileScreenProps {
    onLogout: () => void;
    navigate: (view: string) => void;
    user: UserProfile;
    docs: MedicalDocument[];
    onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, navigate, user, docs, onUpdateProfile }) => {
    const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleQuizComplete = (newProfile: UserProfile) => {
        onUpdateProfile(newProfile);
        setShowQuiz(false);
    };

    const handleProfileSave = (updatedProfile: UserProfile) => {
        onUpdateProfile(updatedProfile);
        setShowEditModal(false);
    }

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
            <ProfileHeader user={user} onEdit={() => setShowEditModal(true)} />
            <div className="p-6 space-y-6">
                <ProfileInfoCard user={user} onEdit={() => setShowQuiz(true)} />
                <DocumentList docs={docs} onPreview={setPreviewDoc} onUpload={() => {
                    // You can add custom upload logic here
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.jpg,.jpeg,.png';
                    input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            alert(`File selected: ${file.name}\n\nUpload functionality will save to Firebase Storage.`);
                        }
                    };
                    input.click();
                }} />
                <SettingsMenu onLogout={onLogout} navigate={navigate} />
                <div className="text-center text-neutral-400 dark:text-neutral-500 text-sm pt-4 space-y-2">
                    <p>Made By Harsh And Abhishek</p>
                    <p className="text-xs px-4">
                        © {new Date().getFullYear()} MediGuardia. All rights reserved. <br/> This is not a substitute for professional medical advice.
                    </p>
                </div>
            </div>
            {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
            {showQuiz && (
                <MedicalQuizScreen
                    initialProfile={user}
                    onComplete={handleQuizComplete}
                    onClose={() => setShowQuiz(false)}
                />
            )}
            {showEditModal && (
                <EditProfileModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleProfileSave}
                />
            )}
        </div>
    );
};