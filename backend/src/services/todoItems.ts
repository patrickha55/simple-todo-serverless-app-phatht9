// import { AttachmentUtils } from './attachmentUtils';
// import * as createError from 'http-errors';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createLogger } from '../utils/logger';
import { CreateTodoRequest } from '../dtos/requests/CreateTodoRequest';
import { getUserId } from '../lambda/utils';
import { Logger } from 'winston';
import { TodoItem } from '../models/TodoItem';
import { TodoItemDTO } from '../dtos/responses/TodoItemDTO';
import { TodoItemsAccess } from '../repositories/todoItemsAccess';
import * as uniqueId from 'uuid';
import { UpdateTodoRequest } from '../dtos/requests/UpdateTodoRequest';

export class TodoItemsService {
    private readonly todoItemsAccess: TodoItemsAccess;
    private readonly logger: Logger;

    constructor() {
        this.todoItemsAccess = new TodoItemsAccess();
        this.logger = createLogger('Todo Service');
    }

    /**
     * Get all todo items of an user.
     * @param event An event
     * @returns A list of todo items.
     */
    async getAllUsersTodoItemsAsync(event: APIGatewayProxyEvent): Promise<TodoItemDTO[]> {
        this.logger.info('Get the userId');

        const userId = getUserId(event);

        const todoItems = await this.todoItemsAccess.getAllTodoItems(userId);

        return todoItems as TodoItemDTO[];
    }

    /**
     * Create new attributes for a todo and calling createTodo from data access.
     * @param event An event.
     * @returns A new todo item.
     */
    async createATodo(event: APIGatewayProxyEvent): Promise<TodoItemDTO> {
        this.logger.info('Create a todo.');

        const userId = getUserId(event);

        const parsedBody: CreateTodoRequest = JSON.parse(event.body);

        const todoId = uniqueId.v4();

        const createdAt = new Date().toISOString();

        const newTodo: TodoItem = {
            todoId,
            userId,
            createdAt,
            attachmentUrl: '',
            done: false,
            ...parsedBody
        };

        await this.todoItemsAccess.createTodo(newTodo);

        const newTodoDTO: TodoItemDTO = {
            ...newTodo
        };

        return newTodoDTO;
    }

    /**
     * Update an existing todo item by getting necessary information and calling todo data access.
     * @param event An event
     * @returns True if update successfully, else false.
     */
    async updateATodo(event: APIGatewayProxyEvent): Promise<boolean> {
        const todoId: string = event.pathParameters.todoId;
        const userId: string = getUserId(event);

        console.log('todoId and userId: ', todoId, userId);
        if (!todoId || !userId) {
            throw new Error('Invalid todoId or userId');
        }

        const todo: UpdateTodoRequest = JSON.parse(event.body);

        console.log('Updated todo attributes', JSON.stringify(todo));

        return await this.todoItemsAccess.updateTodo(todoId, userId, todo);;
    }
}