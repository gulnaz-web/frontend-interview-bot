require('dotenv').config();
const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { TOPIC } = require('./topic');
const { getRandomQuestion, gerCorrectAnswer } = require('./utils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
   const keyboard = new Keyboard()
      .text(TOPIC.HTML)
      .text(TOPIC.CSS)
      .row() // разделяет
      .text(TOPIC.JS)
      .text(TOPIC.REACT)
      .resized(); // редактирует высоту

   await ctx.reply(
      'Привет! Я - Frontend Interview Bot 🤖 \nЯ помогу тебе подготовиться к собеседованию.',
   );

   await ctx.reply('С чего начнем? Выбери тему вопроса в меню 👇', {
      reply_markup: keyboard,
   });
});

bot.hears([TOPIC.HTML, TOPIC.CSS, TOPIC.JS, TOPIC.REACT], async (ctx) => {
   const topic = ctx.message.text;
   const question = getRandomQuestion(topic);
   let inlineKeyboard;

   if (question.hasOptions) {
      const buttonRows = question.options.map((option) => {
         return [
            InlineKeyboard.text(
               option.text,
               JSON.stringify({
                  type: `${topic}-option`,
                  isCorrect: option.isCorrect,
                  questionId: question.id,
               }),
            ),
         ];
      });

      inlineKeyboard = InlineKeyboard.from(buttonRows);
   } else {
      inlineKeyboard = new InlineKeyboard().text(
         'Узнать ответ',
         JSON.stringify({
            type: topic,
            questionId: question.id,
         }),
      );
   }

   await ctx.reply(question.text, {
      reply_markup: inlineKeyboard,
   });
});

bot.on('callback_query:data', async (ctx) => {
   const callbackData = JSON.parse(ctx.callbackQuery.data);

   if (callbackData.isCorrect) {
      await ctx.reply('Верно ✅');
      await ctx.answerCallbackQuery('');
      return;
   }

   if (!callbackData.type.includes('option')) {
      const answer = gerCorrectAnswer(callbackData.type, callbackData.questionId);

      await ctx.reply(answer, {
         parse_mode: 'HTML',
         disable_web_page_preview: true,
      });
      await ctx.answerCallbackQuery('');

      return;
   }

   const answer = gerCorrectAnswer(callbackData.type.split('-')[0], callbackData.questionId);
   await ctx.reply(`Неверно ❌ \nПравильный ответ: ${answer}`);
   await ctx.answerCallbackQuery('');
});

// Error
bot.catch((err) => {
   const ctx = err.ctx;
   console.error(`Error while handling update ${ctx.update.update_id}:`);
   const e = err.error;
   if (e instanceof GrammyError) {
      console.error('Error in request:', e.description);
   } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e);
   } else {
      console.error('Unknown error:', e);
   }
});

bot.start();
