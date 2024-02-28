import express from 'express';
import { getCurrentWeek, getDayName, getCurrentLesson, getNextLesson, getTimeLeft } from './lib/get.js';
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

app.get('/timeleft', async (req, res ) => {
    const date = new Date();
    const currentWeek = getCurrentWeek();
    const requestedDay = getDayName(date.getDay());
    try {
    const model = await getSchedule(requestedDay, currentWeek);
    const currentLesson = getCurrentLesson(model, date);
    const lessonName = currentLesson['lesson_name'];
    const timeLeftInMinutes = await getTimeLeft(currentLesson, date);
    if (timeLeftInMinutes > 0) {
        res.send(timeLeftInMinutes.toString());
    } else {
        res.send(`${lessonName} Закінчилась`);
    }
    }
    catch (error) {
        console.error("Error fetching data:", error);
        
    }
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

