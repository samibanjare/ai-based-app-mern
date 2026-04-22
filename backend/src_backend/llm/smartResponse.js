import { callOllama } from "./ollamaClient.js";

// Detect complex queries
function isComplex(message) {
  const keywords = [
    "explain",
    "how",
    "why",
    "algorithm",
    "machine learning",
    "step by step",
    "math",
    "gradient"
  ];

  return (
    message.length > 120 ||
    keywords.some(k => message.toLowerCase().includes(k))
  );
}

export async function generateSmartResponse(message) {
  try {
    // Step 1: fast model
    let model = "mistral";
    let reply = await callOllama(model, message);

    // Step 2: fallback
    if (isComplex(message) || !reply || reply.length < 80) {
      model = "llama3";
      reply = await callOllama(model, message);
    }

    return { model, reply };

  } catch (err) {
    // Hard fallback
    const reply = await callOllama("llama3", message);
    return { model: "llama3", reply };
  }
}