let countries;
let currentQuestionNumber;
const totalQuestions = 512;
let currentQuestionData;

function startNewGame() {
  currentQuestionNumber = 0;
  currentQuestionData = null;
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      const americanCountries = data.filter(country => (
        country.name.common &&
        country.flags.svg &&
        country.capital && country.capital[0] &&
        country.flags.png && country.flags.png.includes('https://flagcdn.com/w320/') &&
        (country.subregion === 'Northern America' || country.subregion === 'Central America' || country.subregion === 'South America')
      ));

      const europeanCountries = data.filter(country => (
        country.name.common &&
        country.flags.svg &&
        country.capital && country.capital[0] &&
        country.flags.png && country.flags.png.includes('https://flagcdn.com/w320/') &&
        country.subregion === 'Northern Europe' 
      ));

      countries = americanCountries.concat(europeanCountries).map(country => ({
        name: country.name.common,
        flag: country.flags.svg,
        capital: country.capital[0]
      }));

      nextQuestion();
    })
    .catch(error => {
      console.error('Error al obtener los datos de la API:', error);
    });
}

startNewGame();

function getRandomQuestion() {
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const isCapitalQuestion = Math.random() < 0.5;

  return isCapitalQuestion ? generateCapitalQuestion(randomCountry) : generateFlagQuestion(randomCountry);
}

function generateCapitalQuestion(country) {
  return {
    question: `¿Cuál es la capital de ${country.name}?`,
    correctAnswer: country.capital,
    options: getRandomOptions(country.capital, 'capital'),
    flag: country.flag,
  };
}

function generateFlagQuestion(country) {
  return {
    question: `¿Cuál es el país con esta bandera?`,
    correctAnswer: country.name,
    options: getRandomOptions(country.name, 'bandera'),
    flag: country.flag,
  };
}

function getRandomOptions(correctAnswer, questionType) {
  const options = [correctAnswer];
  while (options.length < 4) {
    const randomOption = getRandomOption(questionType);
    if (!options.includes(randomOption) && randomOption !== correctAnswer) {
      options.push(randomOption);
    }
  }
  return shuffleArray(options);
}

function getRandomOption(questionType) {
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  return questionType === 'capital' ? randomCountry.capital : randomCountry.name;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showQuestion(questionData) {
  currentQuestionData = questionData;
  const questionElement = document.getElementById('question');
  questionElement.textContent = questionData.question;

  const options = questionData.options;
  const optionButtons = [
    document.getElementById('option1'),
    document.getElementById('option2'),
    document.getElementById('option3'),
    document.getElementById('option4')
  ];

  const flagImageElement = document.getElementById('flagImage');
  flagImageElement.src = questionData.flag || '';

  optionButtons.forEach((button, index) => {
    button.textContent = options[index];
    button.disabled = false;
    button.removeEventListener('click', checkAnswer);
    button.addEventListener('click', () => checkAnswer(button));
  });

  const respuestaCorrectaElement = document.getElementById('respuestaCorrecta');
  respuestaCorrectaElement.style.display = 'none';
}

function nextQuestion() {
  if (currentQuestionNumber < totalQuestions) {
    const questionData = getRandomQuestion();
    showQuestion(questionData);
    currentQuestionNumber++;

    const optionButtons = [
      document.getElementById('option1'),
      document.getElementById('option2'),
      document.getElementById('option3'),
      document.getElementById('option4')
    ];

    optionButtons.forEach(button => {
      button.classList.remove('btn-success', 'btn-danger');
      button.disabled = false;
    });

    const respuestaCorrectaElement = document.getElementById('respuestaCorrecta');
    respuestaCorrectaElement.style.display = 'none';
    respuestaCorrectaElement.textContent = '';
  } else {
    endGame();
  }
}

let correctAnswers = new Set();
let incorrectAnswers = new Set();
let gameEnded = false;

function checkAnswer(userChoiceButton) {
  if (gameEnded) {
    return;
  }

  const userChoiceText = userChoiceButton.textContent.toLowerCase();
  const correctAnswerLower = currentQuestionData.correctAnswer.toLowerCase();

  const isCorrect = userChoiceText === correctAnswerLower;

  const respuestaCorrectaElement = document.getElementById('respuestaCorrecta');
  respuestaCorrectaElement.style.display = 'block';

  if (isCorrect) {
    correctAnswers.add(currentQuestionData.correctAnswer);
    respuestaCorrectaElement.textContent = 'Respuesta correcta';
    respuestaCorrectaElement.classList.add('text-success');
    respuestaCorrectaElement.classList.remove('text-danger');
    userChoiceButton.classList.add('btn-success');
  } else {
    incorrectAnswers.add(currentQuestionData.correctAnswer);
    respuestaCorrectaElement.textContent = `La respuesta correcta es: ${currentQuestionData.correctAnswer}`;
    respuestaCorrectaElement.classList.remove('text-success');
    respuestaCorrectaElement.classList.add('text-danger');
    userChoiceButton.classList.add('btn-danger');
  }

  const optionButtons = [
    document.getElementById('option1'),
    document.getElementById('option2'),
    document.getElementById('option3'),
    document.getElementById('option4')
  ];

  optionButtons.forEach(button => {
    button.disabled = true;
  });

  if (correctAnswers.size + incorrectAnswers.size === 10) {
    endGame();
  }

  setTimeout(nextQuestion, 200);
}

function endGame() {
  if (gameEnded) {
    return;
  }
  const respuestaCorrectaElement = document.getElementById('respuestaCorrecta');
  respuestaCorrectaElement.style.display = 'none';
  const correctAnswersElement = document.getElementById('correctAnswers');
  const incorrectAnswersElement = document.getElementById('incorrectAnswers');

  correctAnswersElement.style.display = 'block';
  incorrectAnswersElement.style.display = 'block';

  correctAnswersElement.textContent = `Respuestas correctas: ${correctAnswers.size}`;
  incorrectAnswersElement.textContent = `Respuestas incorrectas: ${incorrectAnswers.size}`;
  gameEnded = true;
}
