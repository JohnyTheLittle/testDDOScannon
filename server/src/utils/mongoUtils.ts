import { MongoClient, Collection } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'chatApp';
const COLLECTION_NAME = 'messages';

let messagesCollection: Collection;

export const connectToMongo = async () => {
    try {
        const client = new MongoClient(String(process.env.MONGO_URI));
        await client.connect();
        const db = client.db(DB_NAME);
        messagesCollection = db.collection(COLLECTION_NAME);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

export { messagesCollection };