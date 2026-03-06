import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const callGeminiAPI = async (prompt: string, retries = 3): Promise<string> => {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY tidak ditemukan!");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // KITA KEMBALI KE MODEL TERBARU karena versi lama sudah dihapus Google (404)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log("Mencoba memanggil model: gemini-2.5-flash...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    
    // JIKA KENA ERROR 429 (TOO MANY REQUESTS)
    if (err?.status === 429 && retries > 0) {
      // Google kadang minta tunggu sampai 30 detik. 
      // Kita set jeda waktu 15 detik per antrean agar lebih aman.
      console.warn(`Gemini API kena limit (429). Sistem sedang pending 15 detik... (Sisa percobaan: ${retries - 1})`);
      
      await new Promise(resolve => setTimeout(resolve, 15000));
      return callGeminiAPI(prompt, retries - 1);
    }
    
    console.error("Gemini API Error Akhir:", error);
    throw new Error("Gagal mengambil respons dari AI. Silakan coba lagi nanti.");
  }
};
