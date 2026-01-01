import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const gen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = gen.getGenerativeModel({ model: "gemini-1.5-flash" });

const run = async () => {
  const res = await model.generateContent("Say hello");
  console.log(await res.response.text());
};

run();
