import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

async function testDirectRest() {
    console.log(`Testing Direct REST API for model: ${MODEL}`);

    if (!API_KEY) {
        console.error("API Key missing!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{
            parts: [{ text: "Hello, this is a test." }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ REST API Error Response:");
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("✅ REST API Success:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testDirectRest();
