import dotenv from "dotenv";
import { generateQuestions } from "./services/aiService.js";

dotenv.config();

console.log("---------------------------------------------------");
console.log("DEBUGGING AI SERVICE");
console.log("---------------------------------------------------");

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing in process.env");
} else {
    console.log("✅ GEMINI_API_KEY found (length: " + process.env.GEMINI_API_KEY.length + ")");
}

async function test() {
    console.log("\nAttempting to generate questions...");
    try {
        const questions = await generateQuestions({
            num_of_questions: 1,
            interview_type: "technical",
            role: "Software Engineer",
            experience_level: "Junior",
            topic: "React",
            job_description: "React Developer"
        });
        console.log("\n✅ Questions generated successfully:");
        console.log(JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("\n❌ Error generating questions:");
        console.error(error);
    }
}

test();
