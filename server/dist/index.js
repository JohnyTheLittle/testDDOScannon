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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const worker_threads_1 = require("worker_threads");
const mongodb_1 = require("mongodb");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3001', // Разрешаем только клиент на порту 3001
}));
const PORT = 3000;
const WS_PORT = 9090;
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'chatApp';
const COLLECTION_NAME = 'messages';
// Подключение к MongoDB
const client = new mongodb_1.MongoClient(MONGO_URI);
let messagesCollection;
function connectToMongo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const db = client.db(DB_NAME);
        messagesCollection = db.collection(COLLECTION_NAME);
        console.log('Connected to MongoDB');
    });
}
connectToMongo().then(() => console.log('MongoDB connection established'));
// Буфер для пачки сообщений
let messageBatch = [];
let timeout = null;
// Функция для отправки пачки сообщений в MongoDB
function flushBatch() {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    if (messageBatch.length > 0) {
        console.log('Flushing batch:', messageBatch);
        messagesCollection.insertMany(messageBatch).catch((error) => {
            console.error('Error inserting batch:', error);
        });
        messageBatch = [];
    }
}
// WebSocket сервер
const wss = new ws_1.Server({ port: WS_PORT });
wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
// Запуск воркера для поллинга
const pollingWorker = new worker_threads_1.Worker('./dist/workers/pollingWorker.js');
pollingWorker.on('message', (newMessages) => {
    console.log('New messages from worker:', newMessages);
    // Отправляем новые сообщения всем подключённым клиентам
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(newMessages));
        }
    });
});
pollingWorker.on('error', (error) => {
    console.error('Polling worker error:', error);
});
pollingWorker.on('exit', (code) => {
    console.log(`Polling worker exited with code ${code}`);
});
// Роуты
// POST /messages — создание нового сообщения
app.post('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).send({ error: 'Message text is required' });
        }
        // Создаём новое сообщение
        const message = { text, createdAt: new Date() };
        messageBatch.push(message);
        // Если буфер достиг 10 сообщений, отправляем их в MongoDB
        if (messageBatch.length >= 10) {
            flushBatch();
        }
        else if (!timeout) {
            // Если буфер не заполнен, ставим таймер на 1 секунду
            timeout = setTimeout(flushBatch, 1000);
        }
        res.status(201).send({ message: 'Message received' });
    }
    catch (error) {
        console.error('Error handling POST /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}));
// DELETE /messages — удаление всех сообщений
app.delete('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield messagesCollection.deleteMany({});
        res.status(200).send({ message: 'All messages deleted' });
    }
    catch (error) {
        console.error('Error handling DELETE /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}));
// GET /messages — получение всех сообщений
app.get('/messages', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield messagesCollection.find().toArray();
        const formattedMessages = messages.map((msg) => (Object.assign(Object.assign({}, msg), { _id: msg._id.toString() })));
        res.send(formattedMessages);
    }
    catch (error) {
        console.error('Error handling GET /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}));
// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
