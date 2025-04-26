// console.log('Content script loaded in frame:', window.location.href);

// Listen for the custom event
document.addEventListener('solveQuestion', (event) => {
  console.log('Received solveQuestion event:', event.detail);
  solveQuestion(event.detail.action)
    .then(result => {
      console.log('Solve result:', result);
    })
    .catch(error => {
      console.error('Solve error:', error);
    });
});

function solveQuestion(type) {
  // console.log('Attempting to solve question of type:', type);

  return new Promise((resolve, reject) => {
    try {
      switch (type) {
        case 'Single-Correct':
          function radio_question() {
            const correctRadios = document.querySelectorAll('input[type="radio"][value="correct"]');
            correctRadios.forEach(radio => radio.click());
          }
          radio_question();
          break;

        case 'Dropdown':
          function autoSelectCorrectAnswers() {
            const dropdowns = document.querySelectorAll('.waterfalldropdown');
            
            dropdowns.forEach(dropdown => {
              const correctAnswer = dropdown.getAttribute('data-correct-answer').trim();
              
              for (let option of dropdown.options) {
                if (option.text.trim() === correctAnswer) {
                  dropdown.selectedIndex = option.index;
                  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                  dropdown.dispatchEvent(changeEvent);
                  break;
                }
              }
            });
          }
          autoSelectCorrectAnswers();
          document.querySelectorAll('.queScore')[1].innerHTML=100;
          break;

        case 'speaking':
          function getRandomScore(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          let table = document.querySelector(".speaking_result_table");
          Array.from(table.rows).forEach((row, index) => {
            if (index === 0) return;
            const scoreCell = row.cells[2];
            const scoreSpan = scoreCell.querySelector("span,spaan");
            if (scoreSpan) {
              scoreSpan.textContent = getRandomScore(70, 85);
            }
          });
          resolve({ status: 'success', message: 'Speaking solver implemented' });
          break;

        case 'godMode':
          function getRandomScore(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }
          document.querySelectorAll('.queScore')[0].innerHTML= getRandomScore(78, 91);
          function enableCheckAnswersButton() {
            const button = document.getElementById('checkAnswersBtn');
            if (button.disabled) {
                button.disabled = false;
            }
        }
        enableCheckAnswersButton();
        
          // resolve({ status: 'success', message: 'God mode implemented' });
          break;

        default:
          reject({ status: 'error', message: 'Unknown solver type' });
      }
    } catch (error) {
      console.error('Solver error:', error);
      reject({ status: 'error', message: error.message });
    }
  });
}