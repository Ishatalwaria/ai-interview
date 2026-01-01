import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("🔍 Fetching available models...");
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try a standard generation to see if we can trigger a better error or finding a reliable model.
        // Actually, checking documentation or trying known stable models is safer.
        // However, let's try to hit a model that should exist to see if it works.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ Model '${modelName}' is AVAILABLE.`);
            } catch (error) {
                console.log(`❌ Model '${modelName}' FAILED: ${error.message.split(' ').slice(0, 10).join(' ')}...`);
            }
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
