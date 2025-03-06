"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const worker_threads_1 = require("worker_threads");
const app_1 = require("./app"); // Импортируем WebSocket-сервер из app.ts
const mongoUtils_1 = require("./utils/mongoUtils");
const PORT = 3000;
// Подключение к MongoDB
(0, mongoUtils_1.connectToMongo)().then(() => {
    console.log('MongoDB connection established');
});
// Запуск HTTP-сервера
const server = http_1.default.createServer(app_1.app);
server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
// Запуск воркера для поллинга
const pollingWorker = new worker_threads_1.Worker('./dist/workers/pollingWorker.js');
pollingWorker.on('message', (newMessages) => {
    console.log('New messages from worker:', newMessages);
    // Отправляем новые сообщения всем подключённым клиентам через WebSocket
    app_1.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) { // Используем client.OPEN вместо WebSocket.OPEN
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
