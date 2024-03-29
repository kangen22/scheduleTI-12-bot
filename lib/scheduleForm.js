export let formatLesson = (lesson) => {
  return `Назва пари: ${lesson.lesson_name || "Відсутня"}
Формат пари: ${lesson.format || "Не вказано"} ${lesson.mode || "Не вказано"}
Викладач: ${lesson.teacher_degree} ${lesson.teacher_name || "Не вказано"}
Час: ${lesson.start_time || "Не вказано"} - ${lesson.end_time || "Не вказано"}`;
};

export let formatSchedule = (model) => {
  const grouped = model.reduce((acc, lesson) => {
    const week = lesson.week_number;
    const day = lesson.day_of_week;
    if (!acc[week]) {
      acc[week] = {};
    }
    if (!acc[week][day]) {
      acc[week][day] = [];
    }
    acc[week][day].push(lesson);
    return acc;
  }, {});

  let formattedSchedule = "";
  for (const week in grouped) {
    formattedSchedule += `${week}\n`;
    for (const day in grouped[week]) {
      formattedSchedule += `${day}\n\n`;
      const lessons = grouped[week][day]
        .map(
          (lesson) =>
            `Назва пари: ${lesson.lesson_name || "Відсутня"}
Формат пари: ${lesson.format || "Не вказано"} ${lesson.mode || "Не вказано"}
Викладач: ${lesson.teacher_degree} ${lesson.teacher_name || "Не вказано"}
Час: ${lesson.start_time || "Не вказано"} - ${lesson.end_time || "Не вказано"}`
        )
        .join("\n\n");
      formattedSchedule += `${lessons}\n\n`;
    }
  }

  return formattedSchedule;
};
