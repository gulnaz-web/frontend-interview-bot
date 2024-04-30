const questions = require('./questions.json');
const { Random } = require('random-js');

const getRandomQuestion = (topic) => {
   const random = new Random();
   const questionTopic = topic.toLowerCase();

   const randomQuestionIndex = random.integer(0, questions[questionTopic].length - 1);

   return questions[questionTopic][randomQuestionIndex];
};

const gerCorrectAnswer = (topic, id) => {
   const questionTopic = topic.toLowerCase();

   const question = questions[questionTopic].find((question) => question.id === id);

   // console.log(questions[questionTopic], 'question', id);

   return question?.hasOptions
      ? question.options.find((option) => option.isCorrect).text
      : question.answer;
};

module.exports = { getRandomQuestion, gerCorrectAnswer };
