
import { UserProfile, MedicalDocument, HealthLog, Medication } from '../types';

export const mockUser: UserProfile = {
    name: "Alex Williams",
    email: "alex.w@email.com",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    bloodGroup: "O+",
    allergies: ["Pollen", "Peanuts"],
    chronicConditions: ["Asthma"],
    emergencyContact: { name: "Jane Doe", phone: "123-456-7890" }
};

export const mockDocs: MedicalDocument[] = [
    { id: '1', name: 'Blood Test Results.pdf', type: 'pdf', uploadDate: '2024-06-15', previewUrl: 'mock/blood-test.pdf' },
    { id: '2', name: 'X-Ray Scan.jpg', type: 'jpg', uploadDate: '2024-05-20', previewUrl: 'https://picsum.photos/seed/xray/800/600' },
    { id: '3', name: 'Allergy Report.png', type: 'png', uploadDate: '2024-04-10', previewUrl: 'https://picsum.photos/seed/allergy/800/600' },
];

export const mockHealthLogs: HealthLog[] = [
    { id: "1", date: "2024-07-20", symptom: "Headache", severity: "Minor", details: "Dull ache behind eyes. Took pain reliever." },
    { id: "2", date: "2024-07-18", symptom: "Cough", severity: "Moderate", details: "Persistent dry cough, especially at night." },
    { id: "3", date: "2024-07-15", symptom: "Allergy", severity: "Minor", details: "Itchy eyes and sneezing after being outside." },
];

export const mockMedications: Medication[] = [
    { id: "1", name: "Albuterol", dosage: "2 puffs", frequency: "As needed", time: "Morning" },
    { id: "2", name: "Vitamin D", dosage: "1000 IU", frequency: "Daily", time: "Morning" },
    { id: "3", name: "Loratadine", dosage: "10 mg", frequency: "Daily", time: "Evening" },
];
