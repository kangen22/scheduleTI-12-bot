import pg from 'pg';
import express from 'express';
import { getCurrentWeek, getDayName, getCurrentLesson, getNextLesson } from './lib/get.js';


const port = 3000

const app = express();

let model = [];

const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'University Schedule',
    password: '23022004',
    port: 5432,
});

client.connect();

app.get('/today', async (req, res ) => {
    const date = new Date();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    const currentWeek = getCurrentWeek();
    try {
        const queryText = `
    SELECT 
        sch.id AS schedule_id,
        les.l_name AS lesson_name,
        dow.day AS day_of_week,
        wks.week AS week_number,
        tch.t_name AS teacher_name,
        tch.t_number AS teacher_number,
        tch.degree AS teacher_degree,
        tms.start_time,
        tms.end_time,
        fmt.format,
        fmt.mode
    FROM 
        schedule_ti_12 sch
        INNER JOIN lessons les ON sch.lessons_id = les.id
        INNER JOIN days_of_week dow ON sch.day_id = dow.id
        INNER JOIN weeks wks ON sch.week_id = wks.id
        INNER JOIN teachers tch ON sch.teacher_id = tch.id
        INNER JOIN times tms ON sch.time_id = tms.id
        INNER JOIN formats fmt ON sch.format_id = fmt.id
    WHERE 
        dow.day = $1 AND wks.week = $2;
    
    `;
    const queryResult = await client.query(queryText, [requestedDay, currentWeek]);     
    model = queryResult.rows;
    res.json(model);
    console.log(requestedDay);
    console.log(currentWeek);
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
        const queryText = `
    SELECT 
        sch.id AS schedule_id,
        les.l_name AS lesson_name,
        dow.day AS day_of_week,
        wks.week AS week_number,
        tch.t_name AS teacher_name,
        tch.t_number AS teacher_number,
        tch.degree AS teacher_degree,
        tms.start_time,
        tms.end_time,
        fmt.format,
        fmt.mode
    FROM 
        schedule_ti_12 sch
        INNER JOIN lessons les ON sch.lessons_id = les.id
        INNER JOIN days_of_week dow ON sch.day_id = dow.id
        INNER JOIN weeks wks ON sch.week_id = wks.id
        INNER JOIN teachers tch ON sch.teacher_id = tch.id
        INNER JOIN times tms ON sch.time_id = tms.id
        INNER JOIN formats fmt ON sch.format_id = fmt.id
    WHERE 
        dow.day = $1 AND wks.week = $2;
    
    `;
    const queryResult = await client.query(queryText, [requestedDay, currentWeek]);     
    model = queryResult.rows;
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
        const queryText = `
    SELECT 
        sch.id AS schedule_id,
        les.l_name AS lesson_name,
        dow.day AS day_of_week,
        wks.week AS week_number,
        tch.t_name AS teacher_name,
        tch.t_number AS teacher_number,
        tch.degree AS teacher_degree,
        tms.start_time,
        tms.end_time,
        fmt.format,
        fmt.mode
    FROM 
        schedule_ti_12 sch
        INNER JOIN lessons les ON sch.lessons_id = les.id
        INNER JOIN days_of_week dow ON sch.day_id = dow.id
        INNER JOIN weeks wks ON sch.week_id = wks.id
        INNER JOIN teachers tch ON sch.teacher_id = tch.id
        INNER JOIN times tms ON sch.time_id = tms.id
        INNER JOIN formats fmt ON sch.format_id = fmt.id
    WHERE 
        dow.day = $1 AND wks.week = $2;
    
    `;
    const queryResult = await client.query(queryText, [requestedDay, currentWeek]);     
    model = queryResult.rows;
    const currentLesson = getCurrentLesson(model, date);
    res.json(currentLesson);
    console.log(currentLesson);
    console.log(requestedDay);
    console.log(currentWeek);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

app.get('/next', async (req, res ) => {
    const date = new Date();
    const currentWeek = getCurrentWeek();
    date.setDate(date.getDate());
    const requestedDay = getDayName(date.getDay());
    try {
        const queryText = `
    SELECT 
        sch.id AS schedule_id,
        les.l_name AS lesson_name,
        dow.day AS day_of_week,
        wks.week AS week_number,
        tch.t_name AS teacher_name,
        tch.t_number AS teacher_number,
        tch.degree AS teacher_degree,
        tms.start_time,
        tms.end_time,
        fmt.format,
        fmt.mode
    FROM 
        schedule_ti_12 sch
        INNER JOIN lessons les ON sch.lessons_id = les.id
        INNER JOIN days_of_week dow ON sch.day_id = dow.id
        INNER JOIN weeks wks ON sch.week_id = wks.id
        INNER JOIN teachers tch ON sch.teacher_id = tch.id
        INNER JOIN times tms ON sch.time_id = tms.id
        INNER JOIN formats fmt ON sch.format_id = fmt.id
    WHERE 
        dow.day = $1 AND wks.week = $2;
    
    `;
    const queryResult = await client.query(queryText, [requestedDay, currentWeek]);     
    model = queryResult.rows;
    const nextLesson = getNextLesson(model, date);
    res.json(nextLesson);
    console.log(nextLesson);
    console.log(requestedDay);
    console.log(currentWeek);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});