
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomAnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Lazy initialization to prevent crashes if API key is missing
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
if (!API_KEY) {
      throw new Error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
}
  return ai;
};

const model = 'gemini-2.5-flash';

const schema = {
  type: Type.OBJECT,
  properties: {
    predictedConditions: {
      type: Type.ARRAY,
      description: "A list of possible medical conditions based on the symptoms, from most to least likely. Maximum of 3-4 conditions.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the possible condition." },
          likelihood: { type: Type.STRING, description: "The likelihood of this condition (e.g., 'High', 'Medium', 'Low')." },
        },
        required: ["name", "likelihood"],
      },
    },
    severity: {
      type: Type.STRING,
      description: "An overall assessment of the symptom severity.",
      enum: ['Minor', 'Moderate', 'Severe', 'Emergency'],
    },
    recommendations: {
      type: Type.ARRAY,
      description: "A list of clear, concise, and actionable recommendations for the user. Should be 2-3 bullet points.",
      items: {
        type: Type.STRING,
      },
    },
    disclaimer: {
        type: Type.STRING,
        description: "A standard disclaimer stating that this is not a medical diagnosis."
    }
  },
  required: ["predictedConditions", "severity", "recommendations", "disclaimer"],
};


export const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysisResult> => {
    try {
        const aiInstance = getAI();
        const result = await aiInstance.models.generateContent({
            model: model,
            contents: `Analyze the following symptoms: "${symptoms}"`,
            config: {
                systemInstruction: `You are a helpful AI medical assistant called MediGuardia. Your role is to analyze user-described symptoms and provide potential conditions and recommendations.
                IMPORTANT: You are not a doctor. Your analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                Always start your response with a clear disclaimer.
                Based on the user's symptoms, provide a structured JSON output with potential conditions, an estimated severity level, and actionable next steps.
                Keep the language simple and easy to understand. For severity, 'Emergency' should be used for life-threatening symptoms like chest pain, difficulty breathing, or severe bleeding.`,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = result.text.trim();
        const parsedResult = JSON.parse(jsonText);
        
        // Ensure disclaimer is always present and standardized
        parsedResult.disclaimer = "This is not a medical diagnosis. Please consult a healthcare professional for an accurate assessment.";
        
        return parsedResult as SymptomAnalysisResult;

    } catch (error) {
        console.error("Error analyzing symptoms:", error);
        throw new Error("Failed to analyze symptoms. The AI model may be temporarily unavailable.");
    }
};

export interface EmergencySeverityResult {
    riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
    message: string;
    urgency: string;
}

export interface FirstAidGuide {
    steps: string[];
    dos: string[];
    donts: string[];
    warning: string;
}

/**
 * Analyze emergency severity based on quick questions
 */
export const analyzeEmergencySeverity = async (answers: {
    bleeding: boolean;
    conscious: boolean;
    breathingNormally: boolean;
}): Promise<EmergencySeverityResult> => {
    try {
        const aiInstance = getAI();
        const prompt = `Emergency Assessment:
- Bleeding: ${answers.bleeding ? 'Yes' : 'No'}
- Conscious: ${answers.conscious ? 'Yes' : 'No'}
- Breathing Normally: ${answers.breathingNormally ? 'Yes' : 'No'}

Evaluate the emergency severity and provide risk assessment.`;

        const result = await aiInstance.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: `You are an emergency medical assessment AI. Based on the answers provided, evaluate the emergency severity.
                Return a JSON object with:
                - riskLevel: One of "Low Risk", "Moderate Risk", "High Risk", or "Critical"
                - message: A clear assessment message (e.g., "This is high risk", "Seek help immediately", "Low risk but monitor closely")
                - urgency: Urgency level description
                
                Critical risk: Unconscious, not breathing, severe bleeding
                High risk: Not breathing normally, severe bleeding while conscious
                Moderate risk: Some bleeding, breathing issues
                Low risk: Minor issues, all stable`,
                responseMimeType: "application/json",
            }
        });

        const jsonText = result.text.trim();
        return JSON.parse(jsonText) as EmergencySeverityResult;
    } catch (error) {
        console.error("Error analyzing emergency severity:", error);
        // Fallback assessment
        let riskLevel: EmergencySeverityResult['riskLevel'] = 'Low Risk';
        let message = 'Monitor closely';
        
        if (!answers.conscious || !answers.breathingNormally) {
            riskLevel = 'Critical';
            message = 'Seek help immediately - This is a critical emergency';
        } else if (answers.bleeding && !answers.breathingNormally) {
            riskLevel = 'High Risk';
            message = 'This is high risk - Seek immediate medical attention';
        } else if (answers.bleeding || !answers.breathingNormally) {
            riskLevel = 'Moderate Risk';
            message = 'This requires medical attention';
        }
        
        return { riskLevel, message, urgency: riskLevel };
    }
};

/**
 * Generate first aid guide based on emergency category
 */
export const generateFirstAidGuide = async (category: string, additionalNotes?: string): Promise<FirstAidGuide> => {
    try {
        const aiInstance = getAI();
        const prompt = `Emergency Category: ${category}${additionalNotes ? `\nAdditional Notes: ${additionalNotes}` : ''}

Generate a comprehensive first aid guide with steps, do's, and don'ts.`;

        const result = await aiInstance.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: `You are a first aid expert. Generate a comprehensive first aid guide for the emergency category.
                Return a JSON object with:
                - steps: Array of step-by-step first aid instructions (4-6 steps)
                - dos: Array of things to do (3-4 items)
                - donts: Array of things NOT to do (3-4 items)
                - warning: Important warning message
                
                Make instructions clear, actionable, and appropriate for the emergency type.`,
                responseMimeType: "application/json",
            }
        });

        const jsonText = result.text.trim();
        return JSON.parse(jsonText) as FirstAidGuide;
    } catch (error) {
        console.error("Error generating first aid guide:", error);
        // Fallback to basic first aid
        return {
            steps: [
                'Call emergency services immediately',
                'Stay calm and assess the situation',
                'Provide basic first aid if trained',
                'Keep the person comfortable until help arrives'
            ],
            dos: [
                'Call for professional help',
                'Stay with the person',
                'Keep them calm and comfortable'
            ],
            donts: [
                "Don't move them if injured",
                "Don't give food or water if unconscious",
                "Don't delay calling emergency services"
            ],
            warning: 'This is a medical emergency. Seek professional help immediately.'
        };
    }
};

/**
 * Generate AI-powered SOS message
 */
export const generateSOSMessage = async (data: {
    name: string;
    category: string;
    location: { lat: number; lng: number };
    notes?: string;
    severity?: string;
}): Promise<string> => {
    try {
        const aiInstance = getAI();
        const prompt = `Generate an emergency SOS message:
- Name: ${data.name}
- Emergency Category: ${data.category}
- Location: ${data.location.lat}, ${data.location.lng}
- Additional Notes: ${data.notes || 'None'}
- Severity: ${data.severity || 'Unknown'}

Create a clear, concise emergency message.`;

        const result = await aiInstance.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: `Generate a professional emergency SOS message. Include:
                - Person's name and emergency type
                - Location coordinates
                - Urgency level
                - Clear call to action
                
                Keep it concise (2-3 sentences), professional, and include the Google Maps link.`,
            }
        });

        const message = result.text.trim();
        const mapsLink = `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;
        return `${message}\n\nLocation: ${mapsLink}`;
    } catch (error) {
        console.error("Error generating SOS message:", error);
        // Fallback message
        const mapsLink = `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;
        return `🚨 EMERGENCY SOS 🚨\n\n${data.name} is experiencing ${data.category}.\n\nLocation: ${data.location.lat}, ${data.location.lng}\n\nGoogle Maps: ${mapsLink}\n\n${data.notes ? `Additional Info: ${data.notes}` : ''}\n\nPlease respond immediately.`;
    }
};