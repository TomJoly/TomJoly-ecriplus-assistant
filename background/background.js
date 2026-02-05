// Service Worker - Gère les appels API au LLM

const LLM_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4'
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'askLLM') {
    handleLLMRequest(request.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function handleLLMRequest(questionData) {
  const apiKey = await getStoredApiKey();
  
  if (!apiKey) {
    throw new Error('Clé API non configurée');
  }

  const prompt = buildPrompt(questionData);
  
  const response = await fetch(LLM_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: LLM_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en langue française. Tu aides à analyser des questions de certification en français (orthographe, grammaire, vocabulaire, compréhension). Explique ton raisonnement de manière pédagogique.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  return {
    answer: data.choices[0]?.message?.content,
    usage: data.usage
  };
}

function buildPrompt(questionData) {
  let prompt = `Question : ${questionData.question}\n\n`;
  
  if (questionData.options?.length > 0) {
    prompt += 'Options de réponse :\n';
    questionData.options.forEach((opt, i) => {
      prompt += `${i + 1}. ${opt.text}\n`;
    });
  }
  
  prompt += '\nAnalyse cette question et indique la bonne réponse avec une explication détaillée.';
  
  return prompt;
}

async function getStoredApiKey() {
  const result = await chrome.storage.sync.get(['llmApiKey']);
  return result.llmApiKey;
}