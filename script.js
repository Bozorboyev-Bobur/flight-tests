const topicSelect = document.getElementById("topic-select");
const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultContainer = document.getElementById("result-container");
const scoreEl = document.getElementById("score");

// Добавим подпись перед выбором количества вопросов
const questionCountLabel = document.createElement("label");
questionCountLabel.textContent = "Выберите количество вопросов:";
questionCountLabel.setAttribute("for", "question-count");
questionCountLabel.style.display = "block";
questionCountLabel.style.marginTop = "15px";
questionCountLabel.style.fontWeight = "bold";
startBtn.before(questionCountLabel);

const questionCountSelect = document.createElement("select");
questionCountSelect.id = "question-count";
[10, 20, 30, 50].forEach(num => {
  const option = document.createElement("option");
  option.value = num;
  option.textContent = `${num} вопросов`;
  questionCountSelect.appendChild(option);
});
startBtn.before(questionCountSelect);

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let results = [];
let timerInterval;
let timeLeft = 30;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function collectAllQuestions(data) {
  const all = [];
  for (let topic in data) {
    all.push(...data[topic]);
  }
  return all;
}

function startQuiz() {
  const allQuestions = collectAllQuestions(testData);
  const count = parseInt(document.getElementById("question-count").value);
  questions = shuffle(allQuestions).slice(0, count);
  currentQuestionIndex = 0;
  score = 0;
  results = [];
  startBtn.classList.add("hidden");
  topicSelect.classList.add("hidden");
  document.getElementById("question-count").classList.add("hidden");
  quizContainer.classList.remove("hidden");
  showQuestion();
}

function startTimer() {
  const timerEl = document.getElementById("question-timer");
  timeLeft = 30;
  timerEl.textContent = `⏱ Осталось: ${timeLeft} сек.`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ Осталось: ${timeLeft} сек.`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleNextQuestion();
    }
  }, 1000);
}

function showQuestion() {
  selectedAnswer = null;
  let q = questions[currentQuestionIndex];
  questionNumber.textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";
  for (let key in q.options) {
    let btn = document.createElement("button");
    btn.textContent = `${key}: ${q.options[key]}`;
    btn.classList.add("option-btn");
    btn.onclick = () => {
      selectedAnswer = key;
      document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      nextBtn.disabled = false;
    };
    optionsContainer.appendChild(btn);
  }
  nextBtn.disabled = true;
  startTimer();
}

nextBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  handleNextQuestion();
});

function handleNextQuestion() {
  let q = questions[currentQuestionIndex];
  if (selectedAnswer === q.correctAnswer) {
    score++;
  }
  results.push({
    question: q.question,
    correct: q.correctAnswer,
    selected: selectedAnswer,
    options: q.options
  });
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  scoreEl.textContent = `Вы ответили правильно на ${score} из ${questions.length} вопросов.`;

  const detail = document.createElement("div");
  detail.innerHTML = "<h3>Детальный разбор:</h3>";
  results.forEach((res, index) => {
    const div = document.createElement("div");
    div.className = "result-item";
    const correctText = res.correct === res.selected ? "✅" : "❌";

    let answerFeedback = "<ul style='list-style:none;padding-left:0;'>";
    for (let key in res.options) {
      let cls = "";
      if (key === res.correct) cls = " style='color: green; font-weight: bold;'";
      if (key === res.selected && key !== res.correct) cls = " style='color: red;'";
      answerFeedback += "<li" + cls + ">" + key + ": " + res.options[key] + "</li>";
    }
    answerFeedback += "</ul>";

    div.innerHTML =
      "<p><strong>Вопрос " + (index + 1) + ":</strong> " + res.question + "</p>" +
      answerFeedback +
      "<p>Вы выбрали: <strong>" + (res.selected || "—") + "</strong></p>" +
      "<p>Правильный ответ: <strong>" + res.correct + "</strong> " + correctText + "</p><hr>";

    detail.appendChild(div);
  });

  resultContainer.appendChild(detail);
}

startBtn.addEventListener("click", startQuiz);
topicSelect.remove();
