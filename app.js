import express from 'express';
import { getCurrentWeek, getDayName, getCurrentLesson, getNextLesson, getTimeLeft, getTimeUntilNextLesson } from './lib/get.js';
import getSchedule from './db_connect.js'

const port = 3000

const app = express();

app.get('/today', async (req, res ) => {
    const date = new Date();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    const currentWeek = getCurrentWeek();
    try {
    const model = await getSchedule(requestedDay, currentWeek);
    res.json(model);
} catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send('Error fetching data');
}
});

app.get('/tomorrow', async (req, res ) => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const requestedDay = getDayName(date.getDay());
    const currentWeek = getCurrentWeek();
    try {
    const model = await getSchedule(requestedDay, currentWeek);
    res.json(model);
    console.log(requestedDay);
    console.log(currentWeek);
} catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send('Error fetching data');
}
})

app.get('/current', async (req, res ) => {
    const date = new Date();
    const currentWeek = getCurrentWeek();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    try {
    const model = await getSchedule(requestedDay, currentWeek);
    const currentLesson = getCurrentLesson(model, date);
    res.json(currentLesson);
} catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send('Error fetching data');
    }
});

app.get('/next', async (req, res ) => {
    const date = new Date();
    const currentWeek = getCurrentWeek();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    try {
    const model = await getSchedule(requestedDay, currentWeek);
    const nextLesson = getNextLesson(model, date);
    res.json(nextLesson);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/schedule/:dayOfWeek', async (req, res ) => {
    const dayOfWeek = req.params.dayOfWeek
    const currentWeek = getCurrentWeek();
    try {
    const model = await getSchedule(dayOfWeek, currentWeek);    
    res.json(model);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/timeleft', async (req, res) => {
    const date = new Date();
    const currentWeek = getCurrentWeek();
    const requestedDay = getDayName(date.getDay());
    try {
        const model = await getSchedule(requestedDay, currentWeek);
        const currentLesson = getCurrentLesson(model, date);
        const nextLesson = getNextLesson(model, date);
        const nextLessonName = nextLesson ? nextLesson['lesson_name'] : '';
        const lessonName = currentLesson ? currentLesson['lesson_name'] : '';
        const timeLeftInMinutes = currentLesson ? await getTimeLeft(currentLesson, date) : null;
        if (timeLeftInMinutes && parseInt(timeLeftInMinutes) > 0) {
            res.send(`${timeLeftInMinutes} хвилин до кінця пари "${lessonName}"`);
        } else {
            const timeUntilNextLesson = await getTimeUntilNextLesson(currentLesson, date, model);
            if (timeUntilNextLesson) {
                res.send(`Перерва. Наступна пара "${nextLessonName}" почнеться через ${timeUntilNextLesson} хвилин`);
            } else {
                res.send('Пари закінчились на сьогодні');
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Internal Server Error'); // Обработка ошибок
    }
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

