import * as AWS from 'aws-sdk';
// import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { config } from '../utils/config';
import { UpdateTodoRequest } from '../dtos/requests/UpdateTodoRequest';
import { Logger } from 'winston';

// const XAWS = AWSXRay.captureAWS(AWS);

/**
 * Data access class.
 */
export class TodoItemsAccess {
    private readonly docClient: DocumentClient;
    private readonly todosTable: string;
    private readonly attachmentsBucket: string;
    private readonly logger: Logger;

    constructor() {
        this.docClient = new AWS.DynamoDB.DocumentClient();
        this.todosTable = config.TODOS_TABLE;
        this.attachmentsBucket = config.ATTACHMENT_S3_BUCKET;
        this.logger = createLogger('TodosAccess');
    }

    /**
     * Get all user's todo items.
     * @param userId Id of an user
     * @returns A list of todo items
     */
    getAllTodoItemsAsync = async (userId: string): Promise<TodoItem[]> => {
        this.logger.info('Begin getting all todo items');

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        const items = result.Items;

        return items as TodoItem[];
    };

    /**
     * Create a new todo.
     * @param newTodo Task and due date.
     * @returns A new todo item.
     */
    createTodoAsync = async (newTodo: TodoItem): Promise<void> => {
        try {
            await this.docClient.put({
                TableName: this.todosTable,
                Item: newTodo
            }).promise();
        } catch (error) {
            console.error('Something went wrong. Error: ', error);
        }
    };

    /**
     * Update an existing todo.
     * @param todoId ID of a to do 
     * @param userId ID of an user
     * @param todo Attributes for updating a to do
     * @returns True if update successfully, else false.
     */
    updateTodoAsync = async (todoId: string, userId: string, todo: UpdateTodoRequest): Promise<boolean> => {
        try {
            const update = {
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: "SET ",
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {}
            };

            const updateExpression = [];

            for (const key in todo) {
                if (Object.prototype.hasOwnProperty.call(todo, key)) {
                    const todoAttribute = todo[key];
                    updateExpression.push(`#${key} = :${key}`);
                    update.ExpressionAttributeNames[`#${key}`] = key;
                    update.ExpressionAttributeValues[`:${key}`] = todoAttribute;
                }
            }

            update.UpdateExpression += updateExpression.join(", ");

            const result = await this.docClient.update({
                ...update,
                ReturnValues: "UPDATED_NEW"
            }).promise();

            if (result.$response.error) {
                console.log('Error calling dynamodb update: ', JSON.stringify(result.$response.error));
                return false;
            }
            return true;
        } catch (error) {
            console.error('Something went wrong. Error: ', error);
        }
    };

    /** Add an attachment url to an existing todo item. */
    updateTodoAttachmentAsync = async (todoId: string, userId: string, s3key: string): Promise<boolean> => {
        this.logger.info('Start updating todo item with the attachment url.');


        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${this.attachmentsBucket}.s3.amazonaws.com/${s3key}`
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        if (result.$response.error) {
            this.logger.error('Fail to update a todo attachment.', result.$response.error);
            return false;
        }

        return true;
    };

    /**
     * Delete a todo item by its id and userId.
     * @param todoId ID of a todo item.
     * @param userId ID of an user.
     * @returns True if deleted successfully, else false.
     */
    deleteTodoAsync = async (todoId: string, userId: string): Promise<boolean> => {
        try {
            const result = await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise();

            if (result.$response.error) {
                console.log('Can\'t delete a todo item. Error: ', JSON.stringify(result.$response.error));
                return false;
            }

            return true;
        } catch (error) {
            console.log('Something went wrong', error);
        }
    };

    /**
     * Check to see if a todo item exists.
     * @param todoId ID of a todo item.
     * @returns True if a todo item exist.
     */
    todoExistsAsync = async (todoId: string): Promise<boolean> => {
        try {
            const result = await this.docClient.get({
                TableName: this.todosTable,
                Key: {
                    todoId
                }
            }).promise();

            return !!result.Item;
        } catch (error) {
            console.log('Something went wrong', error);
        }
    };
}