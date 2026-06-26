const DEFAULT_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", authType: "Bearer", supportsVision: true, defaultModel: "gpt-4o-mini" },
  { id: "gemini", name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/", authType: "Bearer", supportsVision: true, defaultModel: "gemini-1.5-flash" },
  { id: "kimi", name: "Kimi (Moonshot)", baseUrl: "https://api.moonshot.ai/v1", authType: "Bearer", supportsVision: true, defaultModel: "moonshot-v1-8k" },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", authType: "Bearer", supportsVision: false, defaultModel: "deepseek-chat" },
  { id: "custom", name: "Custom / Other", baseUrl: "", authType: "Bearer", supportsVision: true, defaultModel: "" },
];

const AI_CONFIG_KEY = "amal_ai_config";
const AI_ENABLED_KEY = "amal_ai_enabled";

export function getDefaultProviders() {
  return DEFAULT_PROVIDERS;
}

export function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    provider: "openai",
    customBaseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    mode: "text", // "text", "image", "both"
    systemPrompt: `Extract items from this invoice/receipt. For each item, provide:
- name: the item name
- price: the price as a number
Return ONLY a JSON array like: [{"name":"Item 1","price":10.50},{"name":"Item 2","price":5.00}]`,
    authType: "Bearer",
  };
}

export function saveAIConfig(config) {
  try { localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config)); } catch (e) {}
}

export function isAIEnabled() {
  try { return localStorage.getItem(AI_ENABLED_KEY) === "true"; } catch (e) { return false; }
}

export function setAIEnabled(enabled) {
  try { localStorage.setItem(AI_ENABLED_KEY, enabled ? "true" : "false"); } catch (e) {}
}

export async function processWithAI(imageFile, ocrText, config) {
  const provider = DEFAULT_PROVIDERS.find(p => p.id === config.provider) || DEFAULT_PROVIDERS[0];
  const baseUrl = config.provider === "custom" ? config.customBaseUrl : provider.baseUrl;

  if (!baseUrl) throw new Error("Base URL is required");
  if (!config.apiKey) throw new Error("API key is required");
  if (!config.model) throw new Error("Model is required");

  const headers = {
    "Authorization": `${config.authType || "Bearer"} ${config.apiKey}`,
    "Content-Type": "application/json"
  };

  let content = [];

  if (config.mode === "text" || config.mode === "both") {
    content.push({ type: "text", text: config.systemPrompt + "\n\nOCR Text:\n" + (ocrText || "") });
  }

  if ((config.mode === "image" || config.mode === "both") && imageFile) {
    const base64Image = await fileToBase64(imageFile);
    content.push({
      type: "image_url",
      image_url: { url: `data:${imageFile.type};base64,${base64Image}` }
    });
  }

  // For text-only mode, content is just a string
  const messageContent = config.mode === "text" 
    ? config.systemPrompt + "\n\nOCR Text:\n" + (ocrText || "")
    : content;

  const payload = {
    model: config.model,
    messages: [
      { role: "system", content: config.systemPrompt },
      { role: "user", content: messageContent }
    ]
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI request failed: ${err}`);
  }

  const data = await response.json();
  const aiText = data.choices?.[0]?.message?.content || "";

  // Try to extract JSON from the response
  const jsonMatch = aiText.match(/\[.*\]/s);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  }

  // Fallback: parse line by line
  return parseItemsFromText(aiText);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseItemsFromText(text) {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    const match = line.match(/^(.+?)[\s\t]+(\d+(?:[.,]\d{1,2})?)\s*$/);
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
