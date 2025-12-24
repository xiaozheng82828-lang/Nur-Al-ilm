const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "API Key Missing in Vercel settings.", sources: [] };
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
