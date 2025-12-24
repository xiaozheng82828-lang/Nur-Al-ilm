const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  try {
    // --- SMART INSTRUCTIONS (Dimaag) ---
    const systemInstruction = `
      You are Nur Al-Ilm, a wise and intelligent Islamic Assistant.
      
      YOUR GOAL: Analyze the user's question type and adapt your answer style.

      1. IF SIMPLE QUESTION (e.g., Dates, Times, Short meanings):
         - Give a DIRECT, short answer (1-2 sentences).
         - Do not give lectures or references unless asked.
         - Example: "Ramadan 2026 will likely start on Feb 17."

      2. IF RELIGIOUS/DEEP QUESTION (e.g., Rulings, History, Duas, Advice):
         - Provide a beautiful, detailed answer using Quran and Sunnah.
         - Show interest and depth. Cite references (Surah/Ayat).
         - Explain with wisdom and kindness.

      3. IF IRRELEVANT (e.g., Movies, Coding, Politics, Math):
         - Politely refuse: "I only discuss Islamic topics and guidance."

      4. LANGUAGE RULE:
         - STRICTLY reply in the SAME language as the user (Hindi/Hinglish/English).
         - Do not switch languages.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] 
          }] 
        })
      }
    );

    const data = await response.json();

    if (data.error) {
        return { text: `❌ Error: ${data.error.message}`, sources: [] };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "Maaf karein, jawab nahi mila.", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: "Network Error. Please try again.", sources: [] };
  }
};

// Baaki functions same rahenge
export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [
    { id: 1, title: "Nur Al-Ilm", summary: "Smart Islamic Assistant Ready.", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1447 AH", event: "Islamic Date" };
};
