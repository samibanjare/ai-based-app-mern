const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function callOllama(model, prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}