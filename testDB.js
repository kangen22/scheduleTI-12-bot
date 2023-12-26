import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.ATLAS_URI;
const dbname = 'ITS_Schedule';
const collection_name = 'TI-12';

const client = new MongoClient(uri);
const collection = client.db(dbname).collection(collection_name);

const connectToDataBase = async () => {
    try {
        await client.connect();
        console.log(`Connected to ${dbname} database`);
    } catch (error) {
        console.log(error);
        process.exit(1); // Добавлен выход из процесса в случае ошибки
    }
}

const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};

const main = async () => {
    try {
        await connectToDataBase();
        let result = await collection.findOne(documentToFind); // Использование await для получения результата
        console.log(result);
    } catch (error) {
        console.log(error);
    } finally {
        await client.close(); // Убедитесь, что это вызывается после завершения всех асинхронных операций
    }
};

main();
