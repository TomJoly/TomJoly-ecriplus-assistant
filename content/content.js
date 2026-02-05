class EcriPlusExtractor {
  constructor() {
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'extractQuestion') {
        const questionData = this.extractQuestionData();
        sendResponse(questionData);
      }
      return true;
    });
  }

  extractQuestionData() {
    // Titre de la competence
    const titleElement = document.querySelector('.challenge-statement__title');
    const title = titleElement ? titleElement.innerText.trim() : '';

    // Consigne/Question principale
    const instructionElement = document.querySelector('.challenge-statement-instruction__text');
    const instruction = instructionElement ? instructionElement.innerText.trim() : '';

    // Labels des propositions (texte autour du champ de reponse)
    const proposalLabels = document.querySelectorAll('.qrocm-proposal__label');
    const labels = Array.from(proposalLabels).map(el => el.innerText.trim()).filter(t => t.length > 0);

    // Options de menu deroulant (Ember Power Select)
    const dropdownOptions = document.querySelectorAll('.ember-power-select-option');
    const dropdownChoices = Array.from(dropdownOptions).map(el => el.innerText.trim()).filter(t => t.length > 0);

    // Options QCM classiques (radio/checkbox)
    const radioOptions = document.querySelectorAll('.challenge-proposals input[type="radio"], .challenge-proposals input[type="checkbox"]');
    const qcmChoices = [];
    radioOptions.forEach((el) => {
      const label = el.closest('label') || el.parentElement.querySelector('label');
      const text = label ? label.innerText.trim() : '';
      if (text) qcmChoices.push(text);
    });

    // Valeur actuellement selectionnee dans le dropdown
    const selectedValue = document.querySelector('.ember-power-select-selected-item');
    const currentSelection = selectedValue ? selectedValue.innerText.trim() : '';

    // Fusion de toutes les options
    const allOptions = [...dropdownChoices, ...qcmChoices];

    // Construction de la question complete
    let question = '';
    if (title) question += 'Competence: ' + title + '\n\n';
    if (instruction) question += instruction;
    if (labels.length > 0) question += '\n\nContexte de reponse: ' + labels.join(' [...] ');
    
    if (allOptions.length > 0) {
      question += '\n\nOptions disponibles:\n';
      allOptions.forEach((opt, i) => {
        question += (i + 1) + '. ' + opt + '\n';
      });
    }

    if (currentSelection) {
      question += '\n(Selection actuelle: ' + currentSelection + ')';
    }

    return {
      question: question,
      options: allOptions.map((text, i) => ({ id: i, text: text })),
      title: title,
      instruction: instruction,
      labels: labels,
      dropdownChoices: dropdownChoices,
      currentSelection: currentSelection,
      url: window.location.href
    };
  }
}

new EcriPlusExtractor();
console.log('Ecri+ Assistant charge');
