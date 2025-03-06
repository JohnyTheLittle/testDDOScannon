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
exports.deleteAllMessages = exports.createMessage = exports.getMessages = void 0;
const messageService_1 = require("../services/messageService");
// GET /messages
const getMessages = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield (0, messageService_1.getMessagesFromDb)();
        res.send(messages);
    }
    catch (error) {
        console.error('Error handling GET /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
exports.getMessages = getMessages;
// POST /messages
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).send({ message: 'Message text is required' });
        }
        // Создаём новое сообщение
        yield (0, messageService_1.saveMessageToDb)({ text, createdAt: new Date() });
        res.status(201).send({ message: 'Message received' });
    }
    catch (error) {
        console.error('Error handling POST /messages:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});
exports.createMessage = createMessage;
// DELETE /messages
const deleteAllMessages = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, messageService_1.deleteAllMessagesFromDb)();
        res.status(200).send({ message: 'All messages deleted', deletedCount: result.deletedCount });
    }
    catch (error) {
        console.error('Error handling DELETE /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
exports.deleteAllMessages = deleteAllMessages;
