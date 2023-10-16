const TelegramApi = require("node-telegram-bot-api");
const scheduleData = require("./schedule");
const token = "6540202655:AAECboxcNpZWV9JG8VPY_wuvNaBNFSVeoyE";
const bot = new TelegramApi(token, { polling: true });

require("dotenv").config();


let formatSchedule = (day, schedule) => {
  const lessons = schedule["Пара"]
    .map(
      (lesson) =>
`Назва пари: ${lesson["Назва пари"] || "Відсутня"}
Пара по порядку: ${lesson["Пара по порядку"]}
Посилання на пару: ${lesson["Посилання на пару"] || "Не вказано"}
Викладач: ${lesson["Викладач"] || "Не вказано"}
Час: ${lesson["Час"] || "Не вказано"}`
    )
    .join("\n\n");
  return `\n${day}:\n${lessons}`;
};

let getDayName = (dayIndex) => {
  const days = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П'ятниця",
    "Субота",
  ];
  return days[dayIndex];
};

let getNextLesson = (schedule, date) => {
  const currentTime = date.getHours() * 60 + date.getMinutes();
  
  for (let lesson of schedule["Пара"]) {
    const [startHour, startMin] = lesson["Час"]
        .split("-")[0]
        .trim()
        .split(":")
        .map(Number);
    const startTime = startHour * 60 + startMin;
    
    if (currentTime < startTime) {
      return lesson;
    }
  }

  return null;
};


let getCurrentLesson = (schedule, date) => {
  if (!schedule) return null;
  const currentTime = date.getHours() * 60 + date.getMinutes();
  
  return schedule["Пара"].find((lesson) => {
      const [startHour, startMin] = lesson["Час"]
          .split("-")[0]
          .trim()
          .split(":")
          .map(Number);
      const [endHour, endMin] = lesson["Час"]
          .split("-")[1]
          .trim()
          .split(":")
          .map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      const isLessonCurrent = currentTime >= startTime && currentTime <= endTime;
      return isLessonCurrent;
  });
};


let getCurrentWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const daysSinceStartOfYear = Math.floor(
    (now - startOfYear) / millisecondsInDay
  );
  const weekNumber = Math.ceil(
    (daysSinceStartOfYear + startOfYear.getDay() + 1) / 7
  );

  const adjustedWeekNumber = weekNumber + 1;
  return adjustedWeekNumber % 2 === 0 ? "Тиждень2" : "Тиждень1";
};



let formatLesson = (lesson) => {
  return `
  Назва пари: ${lesson["Назва пари"] || "Відсутня"}
Пара по порядку: ${lesson["Пара по порядку"]}
Посилання на пару: ${lesson["Посилання на пару"] || "Не вказано"}
Викладач: ${lesson["Викладач"] || "Не вказано"}
Час: ${lesson["Час"] || "Не вказано"}`;
};

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
  console.log("Received /timeLeft command");
  const chatId = msg.chat.id;
  const date = new Date();
  const currentDay = getDayName(date.getDay());
  const currentWeek = getCurrentWeek();
  const isWeek1 = currentWeek === 'Тиждень1';

  const weekSchedule = isWeek1 ? scheduleData[currentDay]['Тиждень1'] : scheduleData[currentDay]['Тиждень2'];
  const currentLesson = getCurrentLesson(weekSchedule, date);

  if (currentLesson) {
    const lessonName = currentLesson['Назва пари'];
    const endTimeString = currentLesson['Час'].split('-')[1].trim();
    const endTime = new Date(`${date.toDateString()} ${endTimeString}:00`);
    const timeDifferenceInMs = endTime - date;
    const timeLeftInMinutes = Math.round(timeDifferenceInMs / 60000);

    if (timeLeftInMinutes > 0) {
      bot.sendMessage(chatId, `До кінця пари залишилось ${timeLeftInMinutes} хвилин`);
    } else {
      bot.sendMessage(chatId, `${lessonName} Закінчилась`);
    }
  } else {
    bot.sendMessage(chatId, "Зараз відсутні пари");
  }
});

bot.onText(/\/next/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const date = new Date();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = scheduleData[requestedDay]
    ? scheduleData[requestedDay][currentWeek]
    : null;
  const nextLesson = getNextLesson(dailySchedule, date);
  
  nextLesson
    ? bot.sendMessage(chatId, formatLesson(nextLesson))
    : bot.sendMessage(chatId, "Немає наступних пар сьогодні");
});



bot.onText(/\/today/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const requestedDay = getDayName(new Date().getDay());
  const weeklySchedule =
    scheduleData[requestedDay] && scheduleData[requestedDay][currentWeek]
      ? scheduleData[requestedDay][currentWeek]
      : null;
  weeklySchedule
    ? bot.sendMessage(chatId, formatSchedule(requestedDay, weeklySchedule))
    : bot.sendMessage(chatId, "Пари відсутні");
});

bot.onText(/\/tomorrow/, (msg) => {
  console.log("Command /tomorrow triggered");
  const chatId = msg.chat.id;
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const requestedDay = getDayName(date.getDay());
  const currentWeek = getCurrentWeek();
  const weeklySchedule = scheduleData[requestedDay][currentWeek];
  weeklySchedule
    ? bot.sendMessage(chatId, formatSchedule(requestedDay, weeklySchedule))
    : bot.sendMessage(chatId, "Пари відсутні");
});

bot.onText(/\/current/, (msg) => {
  const chatId = msg.chat.id;
  const currentWeek = getCurrentWeek();
  const date = new Date();
  const requestedDay = getDayName(date.getDay());
  const dailySchedule = scheduleData[requestedDay]
    ? scheduleData[requestedDay][currentWeek]
    : null;
  const currentLesson = getCurrentLesson(dailySchedule, date);
  currentLesson
    ? bot.sendMessage(chatId, formatLesson(currentLesson), 
      )
    : bot.sendMessage(chatId, "Пари відсутні");
});

bot.onText(/\/schedule/, (msg, match) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [{ text: "Понеділок", callback_data: "Понеділок" }],
      [{ text: "Вівторок", callback_data: "Вівторок" }],
      [{ text: "Середа", callback_data: "Середа" }],
      [{ text: "Четверг", callback_data: "Четверг" }],
      [{ text: "П'ятниця", callback_data: "П'ятниця" }],
      [{ text: "Субота", callback_data: "Субота" }],
      [{ text: "Неділя", callback_data: "Неділя" }],
    ],
  };

  bot.sendMessage(chatId, "Оберіть день тижня:", { reply_markup: keyboard });
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const requestedDay = query.data; 
  const currentWeek = getCurrentWeek();
  const scheduleForDay = scheduleData[requestedDay]
    ? scheduleData[requestedDay][currentWeek]
    : null;
  if (scheduleForDay) {
    bot.sendMessage(chatId, formatSchedule(requestedDay, scheduleForDay));
  } else {
    bot.sendMessage(chatId, "Пари відсутні");
  }
  bot.answerCallbackQuery(query.id, { text: "Обрано " + requestedDay });
});

bot.on("polling_error", (error) => {
  console.log(error.code);
});
