import { Request, Response } from 'express';
import { getMessagesFromDb, saveMessageToDb, deleteAllMessagesFromDb } from '../services/messageService';
import { NewMessage, TypedRequest, TypedResponse } from '../types/types';

// GET /messages
export const getMessages = async (_req: Request, res: Response) => {
    try {
        const messages = await getMessagesFromDb();
        res.send(messages);
    } catch (error) {
        console.error('Error handling GET /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// POST /messages
export const createMessage = async (
    req: any,
    res: any
) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).send({ message: 'Message text is required' });
        }

        // Создаём новое сообщение
        await saveMessageToDb({ text, createdAt: new Date() });

        res.status(201).send({ message: 'Message received' });
    } catch (error) {
        console.error('Error handling POST /messages:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// DELETE /messages
export const deleteAllMessages = async (_req: Request, res: Response) => {
    try {
        const result = await deleteAllMessagesFromDb();
        res.status(200).send({ message: 'All messages deleted', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error handling DELETE /messages:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};