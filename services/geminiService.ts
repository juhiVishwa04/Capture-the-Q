import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [QuestionType.MCQ, QuestionType.THEORY, QuestionType.UNKNOWN],
            description: "The identified type of the question."
          },
          questionText: {
            type: Type.STRING,
            description: "The extracted text of the question."
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of options if it is an MCQ. Empty if theory."
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer text or the full theory answer."
          },
          explanation: {
            type: Type.STRING,
            description: "A clear, educational step-by-step explanation."
          },
          confidenceScore: {
            type: Type.INTEGER,
            description: "Confidence in the answer from 0 to 100."
          },
          isLegible: {
            type: Type.BOOLEAN,
            description: "False if the text is too blurry or unreadable."
          }
        },
        required: ["type", "questionText", "correctAnswer", "explanation", "isLegible", "confidenceScore"],
      },
    },
    overallSummary: {
      type: Type.STRING,
      description: "A brief friendly summary of what was solved."
    }
  },
  required: ["questions"],
};

export const analyzeImageWithGemini = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this image for academic questions. 
            It may contain handwritten or printed text.
            1. Extract every question found.
            2. Classify if it is Multiple Choice (MCQ) or Theory.
            3. Solve it accurately.
            4. Provide a simple, student-friendly explanation.
            5. If the image contains no questions or is completely blurry, mark isLegible as false.
            6. For MCQs, ensure the 'correctAnswer' matches one of the extracted options conceptually or exactly.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert academic tutor. Your goal is to help students understand their homework. Be encouraging, precise, and use simple language.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
