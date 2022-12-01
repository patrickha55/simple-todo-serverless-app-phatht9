import { TodoItemsAccess } from '../repositories/todoItemsAccess';
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
// import { CreateTodoRequest } from '../requests/CreateTodoRequest';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
// import * as uuid from 'uuid';
// import * as createError from 'http-errors';
import { getUserId } from '../lambda/utils';
import { APIGatewayProxyEvent } from 'aws-lambda';

const todoItemsAccess = new TodoItemsAccess();
const logger = createLogger('Todo Service');

export async function getAllUsersTodoItemsAsync(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    logger.info('Get the userId');

    const userId = getUserId(event);

    return await todoItemsAccess.getAllTodoItems(userId);
}