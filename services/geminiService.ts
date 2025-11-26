
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
