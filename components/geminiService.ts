const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- 1. SECURITY GUARD (Gaali Galoch Rokne Wala) ---
export const checkContentSafety = async (content: string) => {
  const lowerCaseContent = content.toLowerCase();
  
  // Gande Shabdon ki List (Bad Words)
  const badWords = [
    "pagal", "kutta", "kamina", "bevakuf", "ullu", "gadha",
    "stupid", "idiot", "nonsense", "rubbish", "die", "kill", "hate",
    "gali", "bakwas", "haram", "terro", "porn", "sex"
  ];

  // Agar user ne gali di, to 'TAMPERING' return karenge -> Isse App user ko SUSPEND kar dega
  if (badWords.some(word => lowerCaseContent.includes(word))) {
    return { status: "tampering" }; 
  }

  return { status: "SAFE" };
};

// --- 2. SMART ANSWER GENERATOR ---
export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  try {
    const systemInstruction = `
      You are Nur Al-Ilm, a respectful and wise Islamic Assistant.
      
      STRICT GUIDELINES:
      
      1. SECURITY CHECK:
         - If the user asks insulting, rude, or inappropriate questions (e.g., mocking religion, dating, bad words), REFUSE politely.
         - Say: "I do not answer such questions. Please maintain respect."
      
      2. QUESTION ANALYSIS:
         - SIMPLE Question (e.g., "Ramadan date", "Meaning of Sabr") -> Give SHORT, DIRECT answer (1-2 lines).
         - DEEP Question (e.g., "Rights of parents", "History of Kaaba") -> Give DETAILED answer with Quran/Hadith references.
      
      3. LANGUAGE:
         - Reply in the SAME language as the user (Hindi/Hinglish/English).
    `;

    // --- UPDATE: 'gemini-1.5-flash-8b' use kar rahe hain (High Speed & High Limit) ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`,
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
        // Agar ye model bhi na chale, to user ko batayenge
        return { text: `❌ Google Error: ${data.error.message}`, sources: [] };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "Maaf karein, main iska jawab nahi de sakta.", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: "Network Error. Please try again.", sources: [] };
  }
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [
    { id: 1, title: "Nur Al-Ilm", summary: "Secure & Fast Mode Active.", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1447 AH", event: "Islamic Date" };
};
