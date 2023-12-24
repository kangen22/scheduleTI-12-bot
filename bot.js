import TelegramApi from 'node-telegram-bot-api'
import dotenv from 'dotenv';
import scheduleData from './local_DB/schedule.js';
import { getCurrentWeek, getDayName, getCurrentLesson, getNextLesson } from './lib/get.js';
import { formatLesson, formatSchedule } from './lib/scheduleForm.js';


dotenv.config();

const token = process.env.TELEGRAM_KEY;
const bot = new TelegramApi(token, {polling: true});
const schedule = scheduleData;

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

bot.onText(/\/timeleft/, (msg) => {
  const chatId = msg.chat.id;
  const date = new Date();
  const currentDay = getDayName(date.getDay());
  const currentWeek = getCurrentWeek();
  const isWeek1 = currentWeek === 'Тиждень1';

  const weekSchedule = isWeek1 ?
    scheduleData[currentDay]['Тиждень1'] :
    scheduleData[currentDay]['Тиждень2'];
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
});

bot.onText(/\/next/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const date = new Date();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = scheduleData[requestedDay] ?
    scheduleData[requestedDay][currentWeek] :
    null;
  const nextLesson = getNextLesson(dailySchedule, date);

  nextLesson ?
    bot.sendMessage(chatId, formatLesson(nextLesson)) :
    bot.sendMessage(chatId, 'Немає наступних пар сьогодні');
});

bot.onText(/\/today/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const requestedDay = getDayName(new Date().getDay());
  const weeklySchedule =
    scheduleData[requestedDay] && scheduleData[requestedDay][currentWeek] ?
      scheduleData[requestedDay][currentWeek] :
      null;
  weeklySchedule ?
    bot.sendMessage(
        chatId,
        formatSchedule(requestedDay, weeklySchedule),
    ) :
    bot.sendMessage(chatId, 'Пари відсутні');
});

bot.onText(/\/tomorrow/, (msg) => {
  const chatId = msg.chat.id;
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const requestedDay = getDayName(date.getDay());
  const currentWeek = getCurrentWeek();
  const weeklySchedule = scheduleData[requestedDay][currentWeek];
  weeklySchedule ?
    bot.sendMessage(
        chatId,
        formatSchedule(requestedDay, weeklySchedule),
    ) :
    bot.sendMessage(chatId, 'Пари відсутні');
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

bot.onText(/\/current/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const date = new Date();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = scheduleData[requestedDay] ?
    scheduleData[requestedDay][currentWeek] :
    null;
  const currentLesson = getCurrentLesson(dailySchedule, date);
  currentLesson ?
    bot.sendMessage(chatId, formatLesson(currentLesson)) :
    bot.sendMessage(chatId, 'Пари відсутні');
});


bot.onText(/\/calendar/, (msg) => {
  const chatId = msg.chat.id;
  const photo = __dirname + '/src/calendar.jpg';
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
