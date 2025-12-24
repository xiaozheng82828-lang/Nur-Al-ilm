const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  try {
    // --- Yahan maine RULES set kiye hain ---
    const systemInstruction = `
      You are Nur Al-Ilm, a direct Islamic assistant.
      RULES:
      1. IDENTIFY LANGUAGE: If user asks in Hinglish/Hindi, answer in Hinglish/Hindi. If English, answer in English. DO NOT switch languages randomly.
      2. BE DIRECT: Give the specific Dua or Answer immediately. Do not start with "Here is the answer".
      3. KEEP IT SHORT: Maximum 3-4 sentences. No long essays.
      4. STRICTLY QURAN & SUNNAH: No personal opinions.
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
    { id: 1, title: "Nur Al-Ilm", summary: "Ask me anything in Hinglish or English.", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1447 AH", event: "Islamic Date" };
};
