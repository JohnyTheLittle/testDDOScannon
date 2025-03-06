import 'dotenv/config'
import http from 'http';
import { Worker } from 'worker_threads';
import { app, wss } from './app'; // Импортируем WebSocket-сервер из app.ts
import { connectToMongo } from './utils/mongoUtils';

const PORT = 3000;

// Подключение к MongoDB
connectToMongo().then(() => {
    console.log('MongoDB connection established');
});

// Запуск HTTP-сервера
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

// Запуск воркера для поллинга
const pollingWorker = new Worker('./dist/workers/pollingWorker.js');

pollingWorker.on('message', (newMessages) => {
    console.log('New messages from worker:', newMessages);

    // Отправляем новые сообщения всем подключённым клиентам через WebSocket
    wss.clients.forEach((client) => {
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