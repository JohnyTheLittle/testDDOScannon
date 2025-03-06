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
const worker_threads_1 = require("worker_threads");
const mongoUtils_1 = require("../utils/mongoUtils");
let lastMessageTimestamp = new Date(0);
// Функция для выполнения поллинга
function pollMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoUtils_1.messagesCollection) {
            console.error('MongoDB collection is not initialized. Waiting for connection...');
            return;
        }
        try {
            const latestMessages = yield mongoUtils_1.messagesCollection
                .find({ createdAt: { $gt: lastMessageTimestamp } })
                .sort({ createdAt: 1 })
                .toArray();
            if (latestMessages.length > 0) {
                // Обновляем метку времени последнего сообщения
                lastMessageTimestamp = latestMessages[latestMessages.length - 1].createdAt;
                // Преобразуем _id в строку
                const formattedMessages = latestMessages.map((msg) => (Object.assign(Object.assign({}, msg), { _id: msg._id.toString() })));
                // Отправляем новые сообщения в основной поток
                if (worker_threads_1.parentPort) {
                    worker_threads_1.parentPort.postMessage(formattedMessages);
                }
            }
        }
        catch (error) {
            console.error('Polling worker error:', error);
        }
    });
}
// Подключаемся к MongoDB и запускаем поллинг
(0, mongoUtils_1.connectToMongo)().then(() => {
    console.log('Polling worker connected to MongoDB');
    setInterval(pollMessages, 1000); // Запускаем поллинг после подключения
}).catch((error) => {
    console.error('Failed to connect to MongoDB in polling worker:', error);
});
