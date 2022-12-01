import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getAllUsersTodoItemsAsync } from '../../services/todoItems';

/**
 * Get all TODO items for a current user
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoItems = await getAllUsersTodoItemsAsync(event);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todoItems
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
