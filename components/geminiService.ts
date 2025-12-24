const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Vercel Settings check karein.", sources: [] };

  try {
    // --- UPDATE: Gemini 1.5 ki jagah Gemini 2.5 Flash use kar rahe hain ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are a polite Islamic assistant. Answer strictly based on Quran and Sunnah: ${prompt}` }] }] })
      }
    );

    const data = await response.json();

    if (data.error) {
        // Agar 2.5 bhi na chale, to fallback error dikhayenge
        return { text: `❌ Google Error: ${data.error.message}\n(Try using 'gemini-pro' if 2.5 fails)`, sources: [] };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "⚠️ Jawab Empty aaya. (Safety Filter triggered).", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: `❌ Network Error: ${error.message}`, sources: [] };
  }
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [
    { id: 1, title: "Nur Al-Ilm Live", summary: "Running on Gemini 2.5 Flash", source: "System", time: "Now", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1447 AH", event: "Islamic Date" };
};
