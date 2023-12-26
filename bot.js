import TelegramApi from 'node-telegram-bot-api'
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getCurrentWeek, getDayName, getCurrentLesson, getNextLesson } from './lib/get.js';
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

bot.onText(/\/timeleft/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:3000/timeleft');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    let data = await response.json();
    let schedule = data[0];
    const date = new Date();
    const currentDay = getDayName(date.getDay());
    const currentWeek = getCurrentWeek();
    const isWeek1 = currentWeek === 'Тиждень1';
    const weekSchedule = isWeek1 ?
      schedule[currentDay]['Тиждень1'] :
      schedule[currentDay]['Тиждень2'];
    const currentLesson = getCurrentLesson(weekSchedule, date);
    if (currentLesson) {
      const lessonName = currentLesson['Назва пари'];
      const endTimeString = currentLesson['Час'].split('-')[1].trim();
      const endTime = new Date(`${date.toDateString()} ${endTimeString}:00`);
      const timeDifferenceInMs = endTime - date;
      const timeLeftInMinutes = Math.round(timeDifferenceInMs / 60000);
      if (timeLeftInMinutes > 0) {
        bot.sendMessage(
            chatId,
            `До кінця пари залишилось ${timeLeftInMinutes} хвилин`,
        );
      } else {
        bot.sendMessage(chatId, `${lessonName} Закінчилась`);
      }
    } else {
      bot.sendMessage(chatId, 'Зараз відсутні пари');
    } 
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
 
});

bot.onText(/\/next/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:3000/next');
    if(!response.ok) {
      throw new Error('Error fetching data');
  } 
  let data = await response.json();
  let schedule = data[0];
  const date = new Date();
  const currentWeek = getCurrentWeek();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = schedule[requestedDay] ?
    scheduleData[requestedDay][currentWeek] :
    null;
  const nextLesson = getNextLesson(dailySchedule, date);
  nextLesson ?
    bot.sendMessage(chatId, formatLesson(nextLesson)) :
    bot.sendMessage(chatId, 'Немає наступних пар сьогодні');
  }  catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:3000/today');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    let data = await response.json();
    let schedule = data[0]; 
    const date = new Date();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    const currentWeek = getCurrentWeek();
    const weeklySchedule = schedule[requestedDay][currentWeek];
      if (!weeklySchedule) {
        bot.sendMessage(chatId, 'Пари відсутні');
      } else {
        const formattedSchedule = formatSchedule(requestedDay, weeklySchedule);
        bot.sendMessage(chatId, formattedSchedule);
      }
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
});

bot.onText(/\/tomorrow/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:3000/tomorrow');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    let data = await response.json();
    let schedule = data[0]; 
    const date = new Date();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay() + 1);
    const currentWeek = getCurrentWeek();
    const weeklySchedule = schedule[requestedDay][currentWeek];
      if (!weeklySchedule) {
        bot.sendMessage(chatId, 'Пари відсутні');
      } else {
        const formattedSchedule = formatSchedule(requestedDay, weeklySchedule);
        bot.sendMessage(chatId, formattedSchedule);
      }
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
});

bot.onText(/\/pizdec/, (msg) => {
  const chatId = msg.chat.id;
  const sessionStartDate = new Date(2024, 0, 8);
  const currentDate = new Date();
  const diffrenceInMilliseconds = sessionStartDate - currentDate;
  const diffrenceInDays = Math.ceil(
      diffrenceInMilliseconds / (1000 * 60 * 60 * 24));
  bot.sendMessage(chatId, `Нам всім пиздець через 
  ${diffrenceInDays} днів (екзамени)`);
});

bot.onText(/\/current/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:3000/current');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
  let data = await response.json();
  let schedule = data[0];
  const currentWeek = getCurrentWeek();
  const date = new Date();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = schedule[requestedDay] ?
    schedule[requestedDay][currentWeek] :
    null;
  const currentLesson = getCurrentLesson(dailySchedule, date);
  currentLesson ?
    bot.sendMessage(chatId, formatLesson(currentLesson)) :
    bot.sendMessage(chatId, 'Пари відсутні');
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
});


bot.onText(/\/calendar/, (msg) => {
  const chatId = msg.chat.id;
  const photo = 'https://photos.app.goo.gl/2B9Fn21yTMqtNQPT9'
  console.log(photo);
  bot.sendPhoto(chatId, photo, {caption: 'Календар - 2023/2024'});
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
    const response = await fetch('http://localhost:3000/schedule');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    let data = await response.json();
    let schedule = data[0];
    const currentWeek = getCurrentWeek();
    const scheduleForDay = schedule[requestedDay] ?
      schedule[requestedDay][currentWeek] :
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
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Пари відсутні');
  }
});

bot.on('polling_error', (error) => {
  console.log(error.code);
});
