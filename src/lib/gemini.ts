import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const callGeminiAPI = async (prompt: string, retries = 3): Promise<string> => {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY tidak ditemukan!");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // PERBAIKAN: Turun ke model 1.5 Flash yang kuota gratisnya jauh lebih besar!
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("Mencoba memanggil model: gemini-1.5-flash...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    
    if (err?.status === 429 && retries > 0) {
      console.warn(`Gemini API kena blokir sementara (429). Menunggu 3 detik... (Sisa percobaan: ${retries - 1})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return callGeminiAPI(prompt, retries - 1);
    }
    
    console.error("Gemini API Error Akhir:", error);
    throw new Error("Gagal mengambil respons dari AI. Silakan coba lagi nanti.");
  }
};
