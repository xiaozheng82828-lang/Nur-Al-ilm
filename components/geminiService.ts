const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to check API Key
const getApiKey = () => {
  if (!API_KEY) {
    console.error("⚠️ Error: VITE_GEMINI_API_KEY nahi mila! Netlify check karein.");
    return null;
  }
  return API_KEY;
};

export const checkContentSafety = async (content: string) => {
  // Basic filter (API call bachane ke liye)
  const lower = content.toLowerCase();
  const badWords = ["kill", "suicide", "hate", "violence"];
  if (badWords.some(w => lower.includes(w))) {
    return { status: "UNSAFE" };
  }
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  const key = getApiKey();
  if (!key) return { text: "System Error: API Key missing.", sources: [] };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are Nur Al-Ilm, a polite Islamic assistant. Answer strictly based on Quran and Sunnah: ${prompt}` }] }]
        })
      }
    );

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return { 
      text: answer || "Maaf karein, main abhi jawab nahi de pa raha.", 
      sources: ["Quran & Sunnah"] 
    };
  } catch (error) {
    console.error("API Error:", error);
    return { text: "Network Error. Please try again.", sources: [] };
  }
};

export const translateContent = async (text: string, targetLang: string) => {
  const key = getApiKey();
  if (!key) return text;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Translate this Islamic text to ${targetLang}: "${text}"` }] }]
        })
      }
    );
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch (e) { return text; }
};

export const generateSpeech = async (text: string) => {
  return null; // Audio feature filhal disabled hai
};
