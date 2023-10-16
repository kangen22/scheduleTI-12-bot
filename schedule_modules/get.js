exports.getCurrentWeek = () => {
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
  

exports.getCurrentLesson = (schedule, date) => {
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


exports.getDayName = (dayIndex) => {
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
  
  exports.getNextLesson = (schedule, date) => {
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