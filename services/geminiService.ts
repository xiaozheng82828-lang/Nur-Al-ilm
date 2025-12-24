import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key. Make sure VITE_GEMINI_API_KEY is set in Netlify.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const checkContentSafety = async (content: string) => {
  // Simple check logic to prevent API overload for now
  const lower = content.toLowerCase();
  const badWords = ["hate", "violence", "kill"]; // Add more basic filters if needed
  if (badWords.some(word => lower.includes(word))) {
    return { status: "UNSAFE" };
  }
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  try {
    const result = await model.generateContent(`
      You are Nur Al-Ilm, a knowledgeable Islamic assistant. 
      Provide a respectful, accurate answer based on Quran and Sunnah for: "${prompt}".
      Format the answer nicely.
    `);
    const response = await result.response;
    return { text: response.text(), sources: ["Quran/Sunnah General Knowledge"] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I apologize, I am having trouble connecting right now. Please try again.", sources: [] };
  }
};

export const translateContent = async (text: string, targetLang: string) => {
  try {
    const result = await model.generateContent(`Translate this Islamic text to ${targetLang}: "${text}"`);
    return result.response.text();
  } catch (error) {
    return text; // Return original if translation fails
  }
};

export const generateSpeech = async (text: string) => {
  // Speech generation is complex and requires specific browser APIs or paid services.
  // Returning null for now to prevent crashes.
  console.log("Speech generation requested for:", text.substring(0, 20) + "...");
  return null;
};
