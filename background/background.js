var LLM_CONFIG = {
  apiUrl: 'https://generativelanguage.googleapis.com/v1/models/',
  model: 'gemini-1.5-pro'
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

  var fetchUrl = LLM_CONFIG.apiUrl + LLM_CONFIG.model + ':generateContent?key=' + result.llmApiKey;

  var response = await fetch(fetchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Tu es un expert en français. Donne LA BONNE RÉPONSE en premier, puis explique brièvement.\n\nQuestion ecri+:\n\n' + questionData.question + '\n\nDonne la bonne réponse.' }]
      }],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    var errData = await response.json().catch(function() { return {}; });
    var errMsg = errData.error && errData.error.message ? errData.error.message : 'Erreur API: ' + response.status;
    throw new Error(errMsg);
  }
  var data = await response.json();
  try {
    return { answer: data.candidates[0].content.parts[0].text };
  } catch(e) {
    throw new Error("Impossible de lire la reponse de l'API");
  }
}
