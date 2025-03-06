import { ObjectId } from 'mongodb';
import { messagesCollection } from '../utils/mongoUtils';

// Буфер для пачки сообщений
let messageBatch: any[] = [];
let timeout: NodeJS.Timeout | null = null;
let isFlushing = false; // Флаг для блокировки

// Функция для отправки пачки сообщений в MongoDB
const flushBatch = async () => {
    if (isFlushing) return; // Если уже отправляется пачка, выходим
    isFlushing = true;

    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    try {
        if (messageBatch.length > 0) {
            console.log(`Flushing batch of ${messageBatch.length} messages`);
            await messagesCollection.insertMany(messageBatch);
            messageBatch = []; // Очищаем буфер
        }
    } catch (error) {
        console.error('Error flushing batch:', error);
        // Если произошла ошибка, сохраняем оставшиеся сообщения для повторной отправки
        messageBatch = [...messageBatch]; // Можно добавить логику повторной попытки
    } finally {
        isFlushing = false; // Снимаем блокировку
    }
};

// Сохранение нового сообщения
export const saveMessageToDb = async (message: { text: string; createdAt: Date }) => {
    // Добавляем сообщение в буфер
    messageBatch.push(message);

    // Если буфер достиг 10 сообщений, отправляем их в MongoDB
    if (messageBatch.length >= 10) {
        await flushBatch();
    } else if (!timeout) {
        // Если буфер не заполнен, ставим таймер на 2 секунды
        timeout = setTimeout(flushBatch, 2000);
    }
};

// Получение всех сообщений
export const getMessagesFromDb = async () => {
    const messages = await messagesCollection.find().toArray();
    return messages.map((msg) => ({ ...msg, _id: msg._id.toString() }));
};

// Удаление всех сообщений
export const deleteAllMessagesFromDb = async () => {
    return await messagesCollection.deleteMany({});
};