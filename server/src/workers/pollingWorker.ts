import { parentPort } from 'worker_threads';
import { messagesCollection, connectToMongo } from '../utils/mongoUtils';

let lastMessageTimestamp = new Date(0);

// Функция для выполнения поллинга
async function pollMessages() {
    if (!messagesCollection) {
        console.error('MongoDB collection is not initialized. Waiting for connection...');
        return;
    }

    try {
        const latestMessages = await messagesCollection
            .find({ createdAt: { $gt: lastMessageTimestamp } })
            .sort({ createdAt: 1 })
            .toArray();

        if (latestMessages.length > 0) {
            // Обновляем метку времени последнего сообщения
            lastMessageTimestamp = latestMessages[latestMessages.length - 1].createdAt;

            // Преобразуем _id в строку
            const formattedMessages = latestMessages.map((msg) => ({
                ...msg,
                _id: msg._id.toString(),
            }));

            // Отправляем новые сообщения в основной поток
            if (parentPort) {
                parentPort.postMessage(formattedMessages);
            }
        }
    } catch (error) {
        console.error('Polling worker error:', error);
    }
}

// Подключаемся к MongoDB и запускаем поллинг
connectToMongo().then(() => {
    console.log('Polling worker connected to MongoDB');
    setInterval(pollMessages, 1000); // Запускаем поллинг после подключения
}).catch((error) => {
    console.error('Failed to connect to MongoDB in polling worker:', error);
});