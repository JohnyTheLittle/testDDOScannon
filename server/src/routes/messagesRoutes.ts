import { Router, Request, Response } from 'express';
import { getMessages, createMessage, deleteAllMessages } from '../controllers/messageController';

const router = Router();

// GET /messages — получение всех сообщений
router.get('/', getMessages);

// POST /messages — создание нового сообщения
router.post('/', createMessage);

// DELETE /messages — удаление всех сообщений
router.delete('/', deleteAllMessages);

export const messageRoutes = router;