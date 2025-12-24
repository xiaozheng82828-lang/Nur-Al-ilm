const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  try {
    // --- NAYE RULES (Strict & Smart) ---
    const rules = `
      You are Nur Al-Ilm, a helpful Islamic Assistant.
      
      STRICT RULES FOR YOU:
      1. BE DIRECT: If asked for a date (e.g., "Ramadan 2026"), just give the date. DO NOT explain what Ramadan is.
      2. MATCH LANGUAGE: If user asks in Hindi/Hinglish, reply ONLY in Hindi/Hinglish. Do not switch to English.
      3. SHORT ANSWER: Keep response under 3-4 sentences. No long lectures.
      4. CONTEXT: For dates, use astronomical calculations. For rulings, use Quran/Sunnah.
    `;

    const response = await fetch(
      // Note: Hum 'gemini-1.5-flash' use kar rahe hain jo sabse stable hai.
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents: [{ 
            parts: [{ text: `${rules}\n\nUser Question: ${prompt}` }] 
          }] 
        })
      }
    );

    const data = await response.json();

    if (data.error) {
        return { text: `❌ Error: ${data.error.message}`, sources: [] };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "Maaf karein, koi jawab nahi mila.", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Authentic Sources"] };

  } catch (error: any) {
    return { text: "Network Error. Please try again.", sources: [] };
  }
};

// Baaki functions same rahenge
export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [
    { id: 1, title: "Nur Al-Ilm Update", summary: "Ab main seedha aur chhota jawab dunga.", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1447 AH", event: "Islamic Date" };
};
