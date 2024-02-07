import TelegramApi from 'node-telegram-bot-api'
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { formatLesson, formatSchedule } from './lib/scheduleForm.js';


dotenv.config();

const token = process.env.TELEGRAM_KEY;
const bot = new TelegramApi(token, {polling: true});


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const message = `
      Ви можете використовувати наступні команди:
      /today - розклад на сьогодні
      /tomorrow - розклад на завтра
      /current - інформація про поточну пару
      /schedule (день тижня) - пари на конкретний день
      /timeleft - час до кінця пари
      /next - наступна пара
      Баг репорт -> @notdotaenjoyer_666 
      `;
    bot.sendMessage(chatId, message);
  });

bot.onText(/\/today/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await fetch('http://localhost:3000/today');
        const data = await response.json();
        const schedule = formatSchedule(data);
        bot.sendMessage(chatId, schedule);
    } catch (error) {
        console.log(error);
    }
});

bot.onText(/\/tomorrow/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await fetch('http://localhost:3000/tomorrow');
        const data = await response.json();
        const schedule = formatSchedule(data);
        bot.sendMessage(chatId, schedule);
    } catch (error) {
        console.log(error);
    }
});


bot.onText(/\/current/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await fetch('http://localhost:3000/current');
        const data = await response.json();
        const schedule = formatLesson(data);
        bot.sendMessage(chatId, schedule);
    } catch (error) {
        console.log(error);
    }
});

bot.onText(/\/next/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await fetch('http://localhost:3000/next');
        const data = await response.json();
        console.log(data);
        if (data.length > 0) {
            const schedule = formatLesson(data);
            bot.sendMessage(chatId, schedule);
        } else {
            bot.sendMessage(chatId, 'Немає наступних пар сьогодні');
        }
    } catch (error) {
        console.log(error);
    }
})



bot.onText(/\/schedule/, (msg, match) => {
    const chatId = msg.chat.id;
    const keyboard = {
      inline_keyboard: [
        [{text: 'Понеділок', callback_data: 'Понеділок'}],
        [{text: 'Вівторок', callback_data: 'Вівторок'}],
        [{text: 'Середа', callback_data: 'Середа'}],
        [{text: 'Четверг', callback_data: 'Четверг'}],
        [{text: 'П\'ятниця', callback_data: 'П\'ятниця'}],
        [{text: 'Субота', callback_data: 'Субота'}],
        [{text: 'Неділя', callback_data: 'Неділя'}],
      ],
    };
  
    bot.sendMessage(chatId, 'Оберіть день тижня:', {reply_markup: keyboard});
  });
  
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const requestedDay = query.data;
    const currentWeek = getCurrentWeek();
    const scheduleForDay = scheduleData[requestedDay] ?
      scheduleData[requestedDay][currentWeek] :
      null;
    if (scheduleForDay) {
      bot.sendMessage(
          chatId,
          formatSchedule(requestedDay, scheduleForDay),
      );
    } else {
      bot.sendMessage(chatId, 'Пари відсутні');
    }
    bot.answerCallbackQuery(query.id, {text: 'Обрано ' + requestedDay});
  });
  
  bot.on('polling_error', (error) => {
    console.log(error.code);
  });
