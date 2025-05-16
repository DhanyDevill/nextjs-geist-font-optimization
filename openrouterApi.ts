const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export interface OpenRouterApiOptions {
  apiKey: string;
}

async function callOpenRouterApi(
  endpoint: string,
  apiKey: string,
  method: "POST" | "GET" = "POST",
  body?: any
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
  };

  const response = await fetch(OPENROUTER_API_BASE + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("OpenRouter API error: " + response.status + " - " + errorText);
  }

  return response.json();
}

// ChatGPT text chat
export async function chatCompletion(
  apiKey: string,
  messages: Array<{ role: string; content: string }>
) {
  return callOpenRouterApi("/chat/completions", apiKey, "POST", {
    model: "gpt-4o-mini", // example model, can be configurable
    messages,
  });
}

// Text-to-Image generation
export async function textToImage(
  apiKey: string,
  prompt: string,
  options?: { width?: number; height?: number; steps?: number }
) {
  return callOpenRouterApi("/images/generations", apiKey, "POST", {
    model: "openai/dall-e-3",
    prompt,
    width: options?.width || 512,
    height: options?.height || 512,
    steps: options?.steps || 20,
  });
}

// Image-to-Video generation (assuming API supports it)
export async function imageToVideo(
  apiKey: string,
  imageUrl: string,
  options?: { duration?: number }
) {
  return callOpenRouterApi("/video/generations", apiKey, "POST", {
    model: "openai/video-gen-1",
    image_url: imageUrl,
    duration: options?.duration || 5,
  });
}

// Text-to-Voice synthesis
export async function textToVoice(
  apiKey: string,
  text: string,
  options?: { voice?: string }
) {
  return callOpenRouterApi("/voice/synthesis", apiKey, "POST", {
    model: "openai/tts-1",
    text,
    voice: options?.voice || "default",
  });
}

// Voice Chat AI (two-way voice interaction)
export async function voiceChat(
  apiKey: string,
  audioData: Blob,
  options?: { language?: string }
) {
  // Assuming API accepts audio as base64 or multipart form data
  // Here we convert Blob to base64 string for simplicity
  const base64Audio = await blobToBase64(audioData);
  return callOpenRouterApi("/voice/chat", apiKey, "POST", {
    model: "openai/voice-chat-1",
    audio: base64Audio,
    language: options?.language || "en-US",
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(",")[1]); // remove data:*/*;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Google Gemini API content generation
export async function googleGeminiGenerateContent(apiKey: string, text: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [{ text }],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Google Gemini API error: " + response.status + " - " + errorText);
  }

  return response.json();
}
