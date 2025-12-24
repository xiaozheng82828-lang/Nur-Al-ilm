const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  // 1. Check if Key exists in code
  if (!API_KEY) return { text: "⚠️ System Error: Vercel Settings mein 'VITE_GEMINI_API_KEY' nahi mili. Kripya Environment Variables check karein aur Redeploy karein.", sources: [] };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are a helpful Islamic Assistant. Question: ${prompt}` }] }] })
      }
    );

    const data = await response.json();

    // 2. Check for Google Errors (Ye sabse zaruri hai)
    if (data.error) {
        return { text: `❌ Google API Error: ${data.error.message}`, sources: [] };
    }

    // 3. Check for Safety Blocks
    if (!data.candidates || data.candidates.length === 0) {
        return { text: "⚠️ Jawab Block ho gaya. (Safety Filter triggered or Empty Response).", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: `❌ Connection Error: ${error.message}`, sources: [] };
  }
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [
    { id: 1, title: "App Live", summary: "Nur Al-Ilm is now running on Vercel.", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1445 AH", event: "Islamic Date" };
};
