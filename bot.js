import TelegramApi from 'node-telegram-bot-api'
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { formatLesson, formatSchedule } from './lib/scheduleForm.js';


dotenv.config();

const token = process.env.TELEGRAM_KEY;
const API_URL = process.env.API_URL;

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
        const response = await fetch(`${API_URL}/today`);
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
        const response = await fetch(`${API_URL}/tomorrow`);
        const data = await response.json();
        const schedule =  formatSchedule(data);
        bot.sendMessage(chatId, schedule);
    } catch (error) {
        console.log(error);
    }
});


bot.onText(/\/current/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await fetch(`${API_URL}/current`);
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
        const response = await fetch(`${API_URL}/next`);
        const data = await response.json();
        console.log(data);
        if (data) {
            const schedule = formatLesson(data);
            bot.sendMessage(chatId, schedule);
        } else {
            bot.sendMessage(chatId, 'Немає наступних пар сьогодні');
        }
    } catch (error) {
        console.log(error);
    }
})

bot.onText(/\/timeleft/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch(`${API_URL}/timeleft`);
    const data = await response.text(); 
    bot.sendMessage(chatId, data);
  } catch (error){
    console.error('Error fetching data:', error);
    // bot.sendMessage(chatId, 'Помилка при отриманні даних. Будь ласка, спробуйте пізніше.');
  }
});


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
  
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const requestedDay = query.data;

    try {
      const response = await fetch(`${API_URL}/schedule/${requestedDay}`);
      const data = await response.json();
      if (data) {
        const scheduleMessage = formatSchedule(data);
        bot.sendMessage(chatId, scheduleMessage);
      } else {
        bot.sendMessage(chatId, 'Немає пар на цей день');
      }
      } 
    catch (error) {
        bot.sendMessage(chatId, 'Помилка');
      }
      bot.answerCallbackQuery(query.id), {text: `Обрано ${requestedDay}`};
  })
  
  bot.on('polling_error', (error) => {
    if (error.code !== 'EFATAL') {
        console.log('Non-fatal polling error:', error);
    } else {
        console.error('Fatal polling error:', error);
    }
});
