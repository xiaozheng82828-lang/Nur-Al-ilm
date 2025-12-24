const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const checkContentSafety = async (content: string) => {
  const lower = content.toLowerCase();
  const badWords = ["pagal", "kutta", "kamina", "stupid", "idiot", "die", "kill", "porn", "sex", "haram", "terro"];
  if (badWords.some(w => lower.includes(w))) return { status: "tampering" };
  return { status: "SAFE" };
};

export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  const systemInstruction = `
    You are Nur Al-Ilm.
    RULES: Keep answers SHORT (3-4 lines) for simple questions. Use Hinglish if asked in Hinglish.
  `;

  // Hum ab 'gemini-1.5-flash' hi use karenge kyunki Nayi Key ke sath ye 100% chalega.
  // Ye sabse fast aur free hai.
  const model = "gemini-1.5-flash"; 

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
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

    // ERROR PACKING: Agar Google ne mana kiya, to hum User ko batayenge
    if (data.error) {
        return { 
            text: `❌ Google Error (${model}): ${data.error.message}\n\nSolution: Please create a NEW API KEY in a NEW PROJECT on Google AI Studio.`, 
            sources: [] 
        };
    }

    if (!data.candidates || data.candidates.length === 0) {
        return { text: "Maaf karein, koi jawab nahi aaya.", sources: [] };
    }

    return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };

  } catch (error: any) {
    return { text: `❌ Network Error: ${error.message}`, sources: [] };
  }
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;
export const getIslamicNews = async () => [{ id: 1, title: "System Update", summary: "Testing New Key", source: "System", time: "Now", url: "#" }];
export const getHijriDate = async () => ({ date: "1447 AH", event: "Islamic Date" });
