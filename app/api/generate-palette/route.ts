import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
You are an expert UI/UX designer. Your task is to generate a cohesive, accessible 16-color theme based on the user's prompt.
You MUST respond with ONLY a raw JSON object. Do not include markdown formatting or any other text.
The JSON object must contain exactly these 16 string keys with valid HEX color codes as values:
- background
- foreground
- card
- cardForeground
- primary
- primaryForeground
- secondary
- secondaryForeground
- muted
- mutedForeground
- border
- pedestalGlow
- pedestalTop
- pedestalTopBorder
- pedestalBody
- pedestalShadow

Rules:
1. "background" and "foreground" must have at least a 4.5:1 contrast ratio.
2. "primary" should be the main accent color that fits the prompt's vibe.
3. "primaryForeground" must contrast well against "primary".
4. If the theme is "dark", the "background" should be dark and "foreground" light.
5. Provide a cohesive theme that strictly fits the prompt.
`;

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `Generate a theme for: "${prompt}"\n\n${systemInstruction}` }] }],
          generationConfig: {
            temperature: 0.7,
          }
        });
        break; // Success
      } catch (err: any) {
        if (err?.status === 503 && retries > 1) {
          console.log(`[✨ AI Magic Generator] 503 Service Unavailable. Retrying in 2 seconds... (${retries - 1} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
        } else {
          throw err;
        }
      }
    }

    if (!result) {
      throw new Error("Failed to generate content after retries");
    }

    const responseText = result.response.text();

    // Parse the JSON out of the response (handle potential markdown formatting)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("\`\`\`json")) {
      jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith("\`\`\`")) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith("\`\`\`")) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    try {
      const parsedTheme = JSON.parse(jsonStr);
      return NextResponse.json(parsedTheme);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", jsonStr);
      return NextResponse.json({ error: "Failed to parse generated theme" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error generating palette:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
