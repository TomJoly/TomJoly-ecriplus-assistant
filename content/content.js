// Script injecté dans les pages ecri+
// Extrait le contenu des questions

class EcriPlusExtractor {
  constructor() {
    this.init();
  }

  init() {
    // Écoute les messages du popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'extractQuestion') {
        const questionData = this.extractQuestionData();
        sendResponse(questionData);
      }
      return true;
    });
  }

  extractQuestionData() {
    // À adapter selon la structure HTML réelle d'ecri+
    const questionElement = document.querySelector('.question-text, [data-question], .enonce');
    const optionsElements = document.querySelectorAll('.option, .reponse, [data-option]');

    const question = questionElement?.innerText?.trim() || '';
    const options = Array.from(optionsElements).map((el, index) => ({
      id: index,
      text: el.innerText?.trim() || ''
    }));

    return {
      question,
      options,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialisation
new EcriPlusExtractor();
console.log('Ecri+ Assistant: Content script chargé');