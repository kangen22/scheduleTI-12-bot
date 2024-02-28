import pg from 'pg';
import queryText from './db/schema.js';
import dotenv from 'dotenv';

dotenv.config();

let model = [];

// Извлекаем URL базы данных из переменных окружения
const connectionString = process.env.DATABASE_URL;

// Создаем конфигурацию клиента с использованием строки подключения
const client = new pg.Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Это необходимо для Heroku, чтобы обойти проверку SSL
    }
});

client.connect();

async function getSchedule(day, week) {
    const queryResult = await client.query(queryText, [day, week]); 
    model = queryResult.rows;
    return model;
}

export default getSchedule;
