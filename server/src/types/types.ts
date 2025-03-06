import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export type Message = {
    _id: string; // MongoDB ObjectId преобразуется в строку
    text: string;
    createdAt: Date;
};

export type NewMessage = Omit<Message, '_id'>; // Новое сообщение без _id

// Расширяем стандартный тип Request
export interface TypedRequest<T> extends ExpressRequest {
    body: T; // Указываем, что req.body имеет тип T
}

// Расширяем стандартный тип Response
export interface TypedResponse<T> extends ExpressResponse {
    json: (body?: T) => this; // Уточняем метод json
}