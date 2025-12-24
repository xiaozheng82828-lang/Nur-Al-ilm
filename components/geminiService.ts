const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "API Key missing.", sources: [] };
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Islamic Answer for: ${prompt}` }] }] })
      }
    );
    const data = await response.json();
    return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response", sources: [] };
  } catch (e) { return { text: "Error connecting to AI.", sources: [] }; }
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

// --- Ye Missing Functions Add Kiye Hain ---
export const getIslamicNews = async () => {
  return [
    { id: 1, title: "Welcome to Nur Al-Ilm", summary: "Your AI assistant is ready.", source: "System", time: "Now", url: "#" },
    { id: 2, title: "Ramadan Preparation", summary: "Prepare for the holy month.", source: "Guide", time: "1d ago", url: "#" }
  ];
};

export const getHijriDate = async () => {
    return { date: "1445 AH", event: "Islamic Date" };
};
