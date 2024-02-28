
import pg from 'pg';
import queryText from './db/schema.js';
import dotenv from 'dotenv';

dotenv.config();

let model = [];

const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const client = new pg.Client({
    user: user,
    host: 'localhost',
    database: database,
    password: password,
    port: 5432,
});

client.connect();

async function getSchedule(day, week) {
    const queryResult = await client.query(queryText, [day, week]); 
    model = queryResult.rows;
    return model;
}

export default getSchedule;