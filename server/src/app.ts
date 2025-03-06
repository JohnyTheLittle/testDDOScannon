import express from 'express';
import cors from 'cors';
import { Server } from 'ws';
import { messageRoutes } from './routes/messagesRoutes';

const app = express();
const PORT = 3000;
const WS_PORT = 9090;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:'+process.env.REACT_PORT }));
app.use('/messages', messageRoutes)

// Создание WebSocket-сервера
const wss = new Server({ port: Number(process.env.WS_PORT) });

wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

export { app, wss };