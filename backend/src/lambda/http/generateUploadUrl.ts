import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUploadUrl } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)
    const todoId = event.pathParameters.todoId

    const uploadUrl = await getUploadUrl(todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    }
  }
)

handler.use(cors())
