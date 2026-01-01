import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    console.log("🚀 Testing Gemini API (latest SDK)...");

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello from the Gemini API!",
    });

    // 🧠 The new SDK sometimes nests output differently
    let textOutput = "";

    // Case 1: preferred path (structured response)
    if (result.output && result.output[0]?.content?.[0]?.text) {
      textOutput = result.output[0].content[0].text;
    }
    // Case 2: sometimes result.candidates exists
    else if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
      textOutput = result.candidates[0].content.parts[0].text;
    }
    // Case 3: raw text property (fallback)
    else if (result.text) {
      textOutput = result.text;
    }

    if (textOutput) {
      console.log("✅ Gemini API response:");
      console.log(textOutput);
    } else {
      console.log("⚠️ Gemini API returned no text output:");
      console.log(result);
    }
  } catch (error) {
    console.error("❌ Gemini API Error:");
    console.error(error);
  }
}

await main();
