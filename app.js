import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import dotenv from 'dotenv';

const port = 3000

dotenv.config();

const app = express();
const uri = process.env.ATLAS_URI
const dbname = 'ITS_Schedule'
const collection_name = 'TI-12';

const client = new MongoClient(uri);

const connectToDataBase = async () => {
    try {
        await client.connect();
        console.log(`Connected to ${dbname} database`)
        return client.db(dbname).collection(collection_name);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
};

connectToDataBase().then((accountCollection) => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });

    app.get('/today', async (req, res ) => {
        console.log("clicked today")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    app.get('/tomorrow', async (req, res ) => {
        console.log("clicked tomorrow")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    app.get('/next', async (req, res ) => {
        console.log("clicked next")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    app.get('/current', async (req, res ) => {
        console.log("clicked current")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get('/timeleft', async (req, res ) => {
        console.log("clicked timeleft")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get('/schedule', async (req, res ) => {
        console.log("clicked schedule")
        try {
            const documentToFind = {_id: new ObjectId("657dcf67998d133402eea11c")};
            const cursor = accountCollection.find(documentToFind);
            const result = await cursor.toArray();
            res.json(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

}).catch((error) => {
    console.log(error);
    process.exit(1);
});





