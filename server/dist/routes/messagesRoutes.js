"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
// GET /messages — получение всех сообщений
router.get('/', messageController_1.getMessages);
// POST /messages — создание нового сообщения
router.post('/', messageController_1.createMessage);
// DELETE /messages — удаление всех сообщений
router.delete('/', messageController_1.deleteAllMessages);
exports.messageRoutes = router;
