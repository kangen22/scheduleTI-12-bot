exports.formatLesson = (lesson) => {
    return `
    Назва пари: ${lesson["Назва пари"] || "Відсутня"}
  Пара по порядку: ${lesson["Пара по порядку"]}
  Посилання на пару: ${lesson["Посилання на пару"] || "Не вказано"}
  Викладач: ${lesson["Викладач"] || "Не вказано"}
  Час: ${lesson["Час"] || "Не вказано"}`;
  };

exports.formatSchedule = (day, schedule) => {
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