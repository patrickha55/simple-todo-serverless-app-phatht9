// import { AttachmentUtils } from './attachmentUtils';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
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

export class TodoItemsService {
    private readonly todoItemsAccess: TodoItemsAccess;
    private readonly logger: Logger;

    constructor() {
        this.todoItemsAccess = new TodoItemsAccess();
        this.logger = createLogger('Todo Service');
    }

    /**
     * 
     * @param event 
     * @returns 
     */
    async getAllUsersTodoItemsAsync(event: APIGatewayProxyEvent): Promise<TodoItemDTO[]> {
        this.logger.info('Get the userId');

        const userId = getUserId(event);

        const todoItems = await this.todoItemsAccess.getAllTodoItems(userId);

        return todoItems as TodoItemDTO[];
    }

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

        return newTodo as TodoItemDTO;
    }
}