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
        body: JSON.stringify({
          error: 'Missing required fields.'
        })
      };
    }

    const newTodoDTO = await todoService.createATodo(event);

    console.log('newTodoDTO', JSON.stringify(newTodoDTO));

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoDTO
      })
    };
  });

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
);
