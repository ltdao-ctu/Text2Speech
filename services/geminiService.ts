import { GoogleGenAI, Modality } from "@google/genai";

// Fix: The 'pitch' property is not supported in speechConfig.
// Instead, we use prompt engineering to instruct the model on the desired pitch.
const getPitchInstruction = (pitch: number): string => {
  if (pitch > 13) {
    return 'Say with a very high pitch: ';
  }
  if (pitch > 5) {
    return 'Say with a high pitch: ';
  }
  if (pitch < -13) {
    return 'Say with a very low pitch: ';
  }
  if (pitch < -5) {
    return 'Say with a low pitch: ';
  }
  return 'Read this aloud: ';
};

export const generateSpeech = async (text: string, voiceName: string, pitch: number): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const instruction = getPitchInstruction(pitch);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `${instruction}${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
