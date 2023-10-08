const TelegramApi = require("node-telegram-bot-api");
const scheduleData = require("./schedule");
const token = "6540202655:AAECboxcNpZWV9JG8VPY_wuvNaBNFSVeoyE";
const bot = new TelegramApi(token, { polling: true });

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
    "Четвер",
    "П'ятниця",
    "Субота",
  ];
  return days[dayIndex];
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
    return currentTime >= startTime && currentTime <= endTime;
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

  return weekNumber % 2 === 0 ? "Тиждень2" : "Тиждень1";
};

let getTimeLeftForLesson = (lesson, date, currentSchedule) => {
  if (!lesson) return "Пари відсутні";

  const [endHour, endMin] = lesson["Час"]
    .split("-")[1]
    .trim()
    .split(":")
    .map(Number);
  const endTime = endHour * 60 + endMin;

  const currentTime = date.getHours() * 60 + date.getMinutes();
  const timeLeft = endTime - currentTime;

  if (timeLeft <= 0) {
    const nextLessonIndex =
      currentSchedule["Пара"].findIndex((l) => l === lesson) + 1;
    const nextLesson = currentSchedule["Пара"][nextLessonIndex];
    if (nextLesson) {
      const [nextStartHour, nextStartMin] = nextLesson["Час"]
        .split("-")[0]
        .trim()
        .split(":")
        .map(Number);
      const nextStartTime = nextStartHour * 60 + nextStartMin;
      const breakTime = nextStartTime - endTime;
      return `Перерва: ${breakTime} хв. До наступної пари залишилось ${
        breakTime - (currentTime - endTime)
      } хв.`;
    } else {
      return "Пара завершилась";
    }
  }
  const hoursLeft = Math.floor(timeLeft / 60);
  const minutesLeft = timeLeft % 60;
  return `До кінця пари: ${hoursLeft} год. ${minutesLeft} хв.`;
};

let formatLesson = (lesson) => {
  return `Назва пари: ${lesson["Назва пари"] || "Відсутня"}
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
    /timeLeft - час до кінця пари
    `;
  bot.sendMessage(chatId, message);
});

bot.onText(/\/timeLeft/, (msg) => {
  const chatId = msg.chat.id;
  const date = new Date();
  const currentDay = getDayName(date.getDay());
  const currentSchedule = scheduleData[currentDay];
  const currentLesson = getCurrentLesson(currentSchedule, date);
  const timeLeft = getTimeLeftForLesson(currentLesson, date, currentSchedule);
  bot.sendMessage(chatId, timeLeft);
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
    ? bot.sendMessage(chatId, formatLesson(currentLesson), {
        parse_mode: `MarkdownV2`,
      })
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
  const requestedDay = query.data; // день тижня, який користувач обрав
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
