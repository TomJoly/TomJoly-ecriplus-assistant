document.addEventListener('DOMContentLoaded', function() {
  var apiKeyInput = document.getElementById('api-key');
  var saveKeyBtn = document.getElementById('save-key');
  var saveStatus = document.getElementById('save-status');
  var extractBtn = document.getElementById('extract-btn');
  var questionPreview = document.getElementById('question-preview');
  var questionText = document.getElementById('question-text');
  var loading = document.getElementById('loading');
  var responseSection = document.getElementById('response-section');
  var llmResponse = document.getElementById('llm-response');
  var errorDiv = document.getElementById('error');

  chrome.storage.sync.get(['llmApiKey'], function(result) {
    if (result.llmApiKey) {
      apiKeyInput.value = result.llmApiKey;
    }
  });

  saveKeyBtn.addEventListener('click', function() {
    var apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ llmApiKey: apiKey }, function() {
        saveStatus.textContent = 'Cle sauvegardee!';
        saveStatus.className = 'status success';
        saveStatus.classList.remove('hidden');
        setTimeout(function() { saveStatus.classList.add('hidden'); }, 2000);
      });
    }
  });

  extractBtn.addEventListener('click', function() {
    errorDiv.classList.add('hidden');
    responseSection.classList.add('hidden');
    questionPreview.classList.add('hidden');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractQuestion' }, function(questionData) {
        if (chrome.runtime.lastError || !questionData || !questionData.question) {
          showError('Rechargez la page ecri+ et reessayez');
          return;
        }

        questionText.textContent = questionData.question.substring(0, 500);
        questionPreview.classList.remove('hidden');
        loading.classList.remove('hidden');

        chrome.runtime.sendMessage({ action: 'askLLM', data: questionData }, function(response) {
          loading.classList.add('hidden');
          if (response && response.answer) {
            llmResponse.textContent = response.answer;
            responseSection.classList.remove('hidden');
          } else {
            showError('Erreur: ' + (response ? response.error : 'Pas de reponse'));
          }
        });
      });
    });
  });

  function showError(msg) {
    loading.classList.add('hidden');
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
});
