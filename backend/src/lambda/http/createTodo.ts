import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = await createTodo(userId, newTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({ item })
    }
  }
)

handler.use(cors())
