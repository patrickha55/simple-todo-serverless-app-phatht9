import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';

const todoService = new TodoItemsService();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing required fields.'
        })
      };
    }

    const newTodoDTO = await todoService.createATodo(event);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newTodoDTO
      })
    };
  });

handler.use(
  cors({
    credentials: true
  })
);
