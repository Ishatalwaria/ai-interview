import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModelsRest() {
    console.log(`Listing Models via REST API...`);

    if (!API_KEY) {
        console.error("API Key missing!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ REST API Error Response:");
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("✅ REST API Success. Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log("No models found in response.");
                console.log(JSON.stringify(data, null, 2));
            }
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

listModelsRest();
