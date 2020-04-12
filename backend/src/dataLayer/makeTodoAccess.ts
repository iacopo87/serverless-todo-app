import { TodoItem } from '../models/index'
import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('todoAccess')

export function makeTodoAccess(
  documentClient = new AWS.DynamoDB.DocumentClient(),
  todoTable = process.env.TODO_TABLE,
  userIdIndex = process.env.USER_ID_INDEX
) {
  const getAllTodos = async function (userId: string): Promise<TodoItem[]> {
    logger.info('Getting items for user...', userId)

    let result = await documentClient
      .query({
        TableName: todoTable,
        IndexName: userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as TodoItem[]
  }

  return { getAllTodos }
}
