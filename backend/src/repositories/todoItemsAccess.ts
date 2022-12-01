import * as AWS from 'aws-sdk';
// import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
// import { TodoUpdate } from '../models/TodoUpdate';
import { config } from '../utils/config';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';

// const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

/**
 * Data access class.
 */
export class TodoItemsAccess {
    private readonly docClient: DocumentClient;
    private readonly todosTable: string;

    constructor() {
        this.docClient = new AWS.DynamoDB.DocumentClient();
        this.todosTable = config.TODOS_TABLE;
    }

    /**
     * Get all user's todo items.
     * @param userId Id of an user
     * @returns A list of todo items
     */
    getAllTodoItems = async (userId: string): Promise<TodoItem[]> => {
        logger.info('Begin getting all todo items');

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
    createTodo = async (newTodo: CreateTodoRequest): Promise<TodoItem> => {
        logger.info(JSON.stringify(newTodo));
        return undefined;
    };
}