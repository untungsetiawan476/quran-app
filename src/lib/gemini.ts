import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const callGeminiAPI = async (prompt: string, retries = 3, delay = 1000): Promise<string> => {
  try {
    console.log("Mencoba memanggil model: gemini-2.5-flash..."); 
    
    // Gunakan model terbaru yang didukung Google saat ini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (retries > 0 && err.status && (err.status === 429 || err.status >= 500)) {
      console.warn(`Gemini API error. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return callGeminiAPI(prompt, retries - 1, delay * 2);
    }
    throw new Error("Gagal mengambil respons dari AI. Silakan coba lagi nanti.");
  }
};