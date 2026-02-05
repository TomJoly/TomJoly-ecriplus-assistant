var LLM_CONFIG = {
  apiUrl: 'https://api.mistral.ai/v1/chat/completions',
  model: 'mistral-small-latest'
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'askLLM') {
    handleLLMRequest(request.data).then(sendResponse).catch(function(e) { sendResponse({ error: e.message }); });
    return true;
  }
});

async function handleLLMRequest(questionData) {
  var result = await chrome.storage.sync.get(['llmApiKey']);
  if (!result.llmApiKey) throw new Error('Cle API non configuree');

  var response = await fetch(LLM_CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + result.llmApiKey },
    body: JSON.stringify({
      model: LLM_CONFIG.model,
      messages: [
        { role: 'system', content: 'Tu es un expert en francais. Donne LA BONNE REPONSE en premier, puis explique brievement.' },
        { role: 'user', content: 'Question ecri+:\n\n' + questionData.question + '\n\nDonne la bonne reponse.' }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) throw new Error('Erreur API: ' + response.status);
  var data = await response.json();
  return { answer: data.choices[0].message.content };
}
