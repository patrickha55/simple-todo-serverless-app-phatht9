import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import * as AWS from 'aws-sdk';
import { config } from '../../utils/config';

const docClient = new AWS.DynamoDB.DocumentClient();

const todoTable = config.TODOS_TABLE;

// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);

    const todos = await docClient.query({
      TableName: todoTable,
      AttributesToGet: 
    });

    return undefined;
  }
);

handler.use(
  cors({
    credentials: true
  })
);
