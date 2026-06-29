import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getModel = () =>
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

// Plain text model for the insights brief
export const getTextModel = () =>
  genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
