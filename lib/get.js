export let getCurrentWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const daysSinceStartOfYear = Math.floor(
      (now - startOfYear) / millisecondsInDay,
  );
  const weekNumber = Math.ceil(
      (daysSinceStartOfYear + startOfYear.getDay() + 1) / 7,
  );

  const adjustedWeekNumber = weekNumber + 1;
  return adjustedWeekNumber % 2 === 0 ? 'Тиждень 2' : 'Тиждень 1';
};


export let getCurrentLesson = (schedule, date) => {
  if (!schedule) return null;
  const currentTime = date.getHours() * 60 + date.getMinutes();
  return schedule.find((lesson) => {
    const [startHour, startMin] = lesson.start_time.split(':').map(Number);
    const [endHour, endMin] = lesson.end_time.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    return currentTime >= startTime && currentTime <= endTime;
  });
};



export let getDayName = (dayIndex) => {
  const days = [
    'Неділя',
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четверг',
    'П\'ятниця',
    'Субота',
  ];
  return days[dayIndex];
};

export let getNextLesson = (schedule, date) => {
  const currentTime = date.getHours() * 60 + date.getMinutes();
  for (const lesson of schedule) {
    const [startHour, startMin] = lesson.start_time.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    if (currentTime < startTime) {
      return lesson;
    }
  }
  return null;
};

export let getTimeLeft = async (currentLesson, date) => {
  const endTimeString = currentLesson['end_time'];
  const endTime = new Date(`${date.toDateString()} ${endTimeString}:00`);
  const timeDifferenceInMs = endTime - date;
  const timeLeftInMinutes = Math.round(timeDifferenceInMs / 60000).toString();
  return timeLeftInMinutes;
};

