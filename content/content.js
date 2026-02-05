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
    const titleElement = document.querySelector('.challenge-statement__title');
    const title = titleElement ? titleElement.innerText.trim() : '';

    const instructionElement = document.querySelector('.challenge-statement-instruction__text');
    const instruction = instructionElement ? instructionElement.innerText.trim() : '';

    const proposalLabels = document.querySelectorAll('.qrocm-proposal__label');
    const labels = Array.from(proposalLabels).map(el => el.innerText.trim()).filter(t => t.length > 0);

    let question = '';
    if (title) question += 'Competence: ' + title + '\n\n';
    if (instruction) question += instruction;
    if (labels.length > 0) question += '\n\nContexte: ' + labels.join(' [...] ');

    return {
      question: question,
      options: [],
      url: window.location.href
    };
  }
}

new EcriPlusExtractor();
console.log('Ecri+ Assistant charge');
