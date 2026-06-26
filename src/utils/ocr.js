import Tesseract from "tesseract.js";

// Toggle this when you connect your AI service
const USE_AI_OCR = false;

export async function extractTextFromImage(imageFile, onProgress) {
  const result = await Tesseract.recognize(
    imageFile,
    "eng+ara",
    {
      logger: (m) => { if (onProgress) onProgress(m.status === "recognizing text" ? m.progress : 0); }
    }
  );
  let text = result.data.text;

  if (USE_AI_OCR) {
    // TODO: Call your AI API here to clean up / structure the text
    // text = await enhanceWithAI(text);
  }

  return text;
}

export function parseItemsFromText(text) {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    const match = line.match(/^(.*?)[\s\t]+(\d+(?:[.,]\d{1,2})?)\s*$/);
    if (match) {
      const name = match[1].trim().replace(/[^\w\s\-\u0600-\u06FF]/g, " ").trim();
      const price = parseFloat(match[2].replace(",", "."));
      if (name.length > 1 && !isNaN(price) && price > 0) {
        items.push({ name, price });
      }
    }
  }
  return items;
}
