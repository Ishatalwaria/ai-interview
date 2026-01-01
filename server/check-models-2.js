import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function check() {
    console.log("🔑 Checking API Key with various models...");

    const candidates = [
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-pro-vision"
    ];

    for (const modelName of candidates) {
        try {
            process.stdout.write(`Testing ${modelName}... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ SUCCESS! Response: ${response.text().slice(0, 20)}...`);
            // If one works, we might want to stop or just list all working ones.
        } catch (error) {
            let msg = error.message || "";
            if (msg.includes("404")) console.log("❌ 404 Not Found");
            else if (msg.includes("429")) console.log("⚠️ 429 Rate Limit");
            else console.log(`❌ FAILED: ${msg.slice(0, 50)}...`);
        }
    }
}

check();
