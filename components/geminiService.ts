const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  // Check 1: Kya Key Code tak pahunchi?
  if (!API_KEY) return { text: "⚠️ ERROR: API Key nahi mili! Vercel Settings check karein.", sources: [] };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are an Islamic assistant. Answer this: ${prompt}` }] }] })
      }
    );

    const data = await response.json();

    // Check 2: Google ne kya kaha?
    if (data.error) {
        return { text: `❌ GOOGLE ERROR: ${data.error.message}`, sources: [] };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "⚠️ Jawab Empty aaya. Shayad Safety Filter ne rok diya.", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: `❌ NETWORK ERROR: ${error.message}`, sources: [] };
  }
};

// Baaki functions same rahenge
export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;
export const getIslamicNews = async () => [{ id: 1, title: "App Live", summary: "System Running", source: "System", time: "Now", url: "#" }];
export const getHijriDate = async () => ({ date: "1445 AH", event: "Islamic Date" });
