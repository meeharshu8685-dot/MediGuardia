// Core Types for MediGuardia App

export interface SymptomAnalysisResult {
    predictedConditions: {
        name: string;
        likelihood: string;
    }[];
    severity: 'Minor' | 'Moderate' | 'Severe' | 'Emergency';
    recommendations: string[];
    disclaimer: string;
    symptoms?: string[];
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    notes?: string;
    reminderEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface HealthLog {
    id: string;
    date: string;
    symptom: string;
    severity: 'Minor' | 'Moderate' | 'Severe';
    details: string;
    inputText?: string;
    conditions?: string[];
    riskLevel?: string;
    timestamp?: string;
}

export interface MedicalDocument {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png' | 'jpeg';
    uploadDate: string;
    previewUrl: string;
    downloadUrl?: string;
    size?: number;
    userId?: string;
}

export interface UserProfile {
    name: string;
    email: string;
    avatarUrl: string;
    age?: number;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
    };
    mobileNumber?: string;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    currentMedications?: string;
}

export interface Hospital {
    id: string;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    distance?: number;
    openHours?: string;
    emergencyServices?: boolean;
    specialties?: string[];
    rating?: number;
    reviewCount?: number;
    google_maps_url?: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface SOSLog {
    id: string;
    userId: string;
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
    status?: 'active' | 'resolved';
    emergencyContactNotified?: boolean;
}

export interface Quote {
    id: string;
    text: string;
    author?: string;
    category?: string;
    createdAt?: string;
}

export interface SupportRequest {
    id: string;
    userId: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved';
    createdAt: string;
    updatedAt?: string;
}

export interface Feedback {
    id: string;
    userId: string;
    message: string;
    rating: number;
    createdAt: string;
}

export interface FirstAidCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface FirstAidInstruction {
    id: string;
    category: string;
    title: string;
    steps: string[];
    warnings?: string[];
    whenToSeekHelp?: string;
}

export interface NotificationPreferences {
    generalNotifications: boolean;
    medicationReminders: boolean;
    symptomCheckReminders: boolean;
}

export interface AppSettings {
    language: string;
    darkMode: boolean;
    biometricLock: boolean;
    notificationPreferences: NotificationPreferences;
}
