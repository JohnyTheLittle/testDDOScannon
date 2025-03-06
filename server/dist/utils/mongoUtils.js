"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesCollection = exports.connectToMongo = void 0;
const mongodb_1 = require("mongodb");
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'chatApp';
const COLLECTION_NAME = 'messages';
let messagesCollection;
const connectToMongo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new mongodb_1.MongoClient(String(process.env.MONGO_URI));
        yield client.connect();
        const db = client.db(DB_NAME);
        exports.messagesCollection = messagesCollection = db.collection(COLLECTION_NAME);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
});
exports.connectToMongo = connectToMongo;
