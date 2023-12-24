import {MongoClient} from 'mongodb';
import express from 'express';
import dotenv from 'dotenv';

const port = 3000

dotenv.config();

const app = express();
const uri = process.env.ATLAS_URI
const dbname = 'cluster0'
const collection_name = 'TI-12';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectToDataBase = async () => {
    try {
        await client.connect();
        console.log(`Connected to ${dbname} database`)
        return client.db(dbname).collection(collection_name);
    } catch (error) {
        console.log(error)
    }

};


const acconts = client.db("accounts").collection("accounts")



// app.get('/today', (req, res) => {
//     console.log("clicked today")
// })


// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`);
// })
// // 




