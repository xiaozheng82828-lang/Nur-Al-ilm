const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- 1. SECURITY GUARD (Bad Words Filter) ---
export const checkContentSafety = async (content: string) => {
  const lower = content.toLowerCase();
  const badWords = ["pagal", "kutta", "kamina", "stupid", "idiot", "die", "kill", "porn", "sex", "haram", "terro"];
  
  if (badWords.some(w => lower.includes(w))) return { status: "tampering" };
  return { status: "SAFE" };
};

// --- 2. SMART MULTI-MODEL GENERATOR ---
export const generateIslamicAnswer = async (prompt: string) => {
  if (!API_KEY) return { text: "⚠️ API Key Missing! Settings check karein.", sources: [] };

  const systemInstruction = `
    You are Nur Al-Ilm, an Islamic Assistant.
    RULES:
    1. SIMPLE questions (Dates, Meaning) -> SHORT answer (1-2 lines).
    2. DEEP questions (Rulings, History) -> DETAILED answer with Quran/Hadith.
    3. LANGUAGE -> Reply in the SAME language as user (Hindi/English).
    4. SAFETY -> Politely refuse insulting questions.
  `;

  // List of models to try (in order of preference)
  // 1. Flash-002 (Stable & Fast)
  // 2. Flash (Standard)
  // 3. 2.0 Exp (Backup, has limits)
  // 4. Pro (Old but reliable)
  const models = [
    "gemini-1.5-flash-002",
    "gemini-1.5-flash", 
    "gemini-2.0-flash-exp",
    "gemini-pro"
  ];

  for (const model of models) {
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

      // Agar Model mil gaya aur jawab aaya
      if (!data.error && data.candidates && data.candidates.length > 0) {
        return { text: data.candidates[0].content.parts[0].text, sources: ["Quran & Sunnah"] };
      }
      
      // Agar 'Not Found' error aaya to loop agle model par jayega
      console.log(`Model ${model} failed, trying next...`);

    } catch (e) {
      // Network error, try next
    }
  }

  // Agar saare models fail ho gaye
  return { text: "Maaf karein, abhi server busy hai. Thodi der baad try karein.", sources: [] };
};

export const translateContent = async (text: string, l: string) => text;
export const generateSpeech = async (text: string) => null;

export const getIslamicNews = async () => {
  return [{ id: 1, title: "Nur Al-Ilm", summary: "Auto-Fix System Active.", source: "System", time: "Now", url: "#" }];
};

export const getHijriDate = async () => ({ date: "1447 AH", event: "Islamic Date" });
