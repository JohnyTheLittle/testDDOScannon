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
exports.deleteAllMessagesFromDb = exports.getMessagesFromDb = exports.saveMessageToDb = void 0;
const mongoUtils_1 = require("../utils/mongoUtils");
// Буфер для пачки сообщений
let messageBatch = [];
let timeout = null;
let isFlushing = false; // Флаг для блокировки
// Функция для отправки пачки сообщений в MongoDB
const flushBatch = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isFlushing)
        return; // Если уже отправляется пачка, выходим
    isFlushing = true;
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    try {
        if (messageBatch.length > 0) {
            console.log(`Flushing batch of ${messageBatch.length} messages`);
            yield mongoUtils_1.messagesCollection.insertMany(messageBatch);
            messageBatch = []; // Очищаем буфер
        }
    }
    catch (error) {
        console.error('Error flushing batch:', error);
        // Если произошла ошибка, сохраняем оставшиеся сообщения для повторной отправки
        messageBatch = [...messageBatch]; // Можно добавить логику повторной попытки
    }
    finally {
        isFlushing = false; // Снимаем блокировку
    }
});
// Сохранение нового сообщения
const saveMessageToDb = (message) => __awaiter(void 0, void 0, void 0, function* () {
    // Добавляем сообщение в буфер
    messageBatch.push(message);
    // Если буфер достиг 10 сообщений, отправляем их в MongoDB
    if (messageBatch.length >= 10) {
        yield flushBatch();
    }
    else if (!timeout) {
        // Если буфер не заполнен, ставим таймер на 2 секунды
        timeout = setTimeout(flushBatch, 2000);
    }
});
exports.saveMessageToDb = saveMessageToDb;
// Получение всех сообщений
const getMessagesFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield mongoUtils_1.messagesCollection.find().toArray();
    return messages.map((msg) => (Object.assign(Object.assign({}, msg), { _id: msg._id.toString() })));
});
exports.getMessagesFromDb = getMessagesFromDb;
// Удаление всех сообщений
const deleteAllMessagesFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield mongoUtils_1.messagesCollection.deleteMany({});
});
exports.deleteAllMessagesFromDb = deleteAllMessagesFromDb;
