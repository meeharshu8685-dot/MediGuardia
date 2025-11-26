
export interface SymptomAnalysisResult {
    predictedConditions: {
        name: string;
        likelihood: string;
    }[];
    severity: 'Minor' | 'Moderate' | 'Severe' | 'Emergency';
    recommendations: string[];
    disclaimer: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time: string;
}

export interface HealthLog {
    id: string;
    date: string;
    symptom: string;
    severity: 'Minor' | 'Moderate' | 'Severe';
    details: string;
}

export interface MedicalDocument {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png';
    uploadDate: string;
    previewUrl: string;
}

export interface UserProfile {
    name: string;
    email: string;
    avatarUrl: string;
    age?: number;
    height?: string;
    weight?: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContact: {
        name: string;
        phone: string;
    };
}