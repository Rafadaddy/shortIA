import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hola, genera un chiste muy corto.",
    });
    console.log("TEST EXITOSO. Respuesta:", response.text());
  } catch (error) {
    console.error("ERROR EN TEST:", error);
  }
}

test();
