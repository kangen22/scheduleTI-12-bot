import pg from 'pg';
import queryText from './db/schema.js';
import dotenv from 'dotenv';

dotenv.config();

let model = [];

const connectionString = process.env.DATABASE_URL;

const client = new pg.Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false 
    }
});

client.connect();

async function getSchedule(day, week) {
    const queryResult = await client.query(queryText, [day, week]); 
    model = queryResult.rows;
    return model;
}

export default getSchedule;
