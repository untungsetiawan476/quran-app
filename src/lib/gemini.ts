import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const callGeminiAPI = async (prompt: string, retries = 3): Promise<string> => {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY tidak ditemukan!");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log("Mencoba memanggil model: gemini-2.5-flash...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error: unknown) {
    // Casting aman pengganti 'any' agar ESLint tidak marah
    const err = error as { status?: number; message?: string };
    
    // JIKA KENA ERROR 429 (TOO MANY REQUESTS) DAN MASIH ADA JATAH RETRY
    if (err?.status === 429 && retries > 0) {
      console.warn(`Gemini API kena blokir sementara (429). Menunggu 3 detik... (Sisa percobaan: ${retries - 1})`);
      
      // Tunggu 3 detik sebelum mencoba lagi (Jeda napas untuk server Google)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Panggil dirinya sendiri lagi (Recursive) dengan sisa retry dikurangi 1
      return callGeminiAPI(prompt, retries - 1);
    }
    
    // Jika error lain atau jatah retry habis
    console.error("Gemini API Error Akhir:", error);
    throw new Error("Gagal mengambil respons dari AI. Silakan coba lagi nanti.");
  }
};
