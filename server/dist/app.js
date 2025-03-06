"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const messagesRoutes_1 = require("./routes/messagesRoutes");
const app = (0, express_1.default)();
exports.app = app;
const PORT = 3000;
const WS_PORT = 9090;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: 'http://localhost:' + process.env.REACT_PORT }));
app.use('/messages', messagesRoutes_1.messageRoutes);
// Создание WebSocket-сервера
const wss = new ws_1.Server({ port: Number(process.env.WS_PORT) });
exports.wss = wss;
wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
