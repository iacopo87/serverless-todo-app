import { TodoItem, TodoUpdate } from '../models/index'
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

  const createTodo = async function (item: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo item..', item)

    await documentClient
      .put({
        TableName: todoTable,
        Item: item
      })
      .promise()

    return item
  }

  const updateTodo = async function (
    todoId: String,
    request: TodoUpdate
  ): Promise<void> {
    logger.info('Update todo item..', todoId, request)
    const { name, dueDate, done } = request

    let queryResult = await documentClient
      .query({
        TableName: todoTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()
    logger.info('Retrieved item', queryResult)

    await documentClient
      .update({
        TableName: todoTable,
        Key: { todoId, createdAt: queryResult.Items[0].createdAt },
        UpdateExpression: 'set #todoName=:name, dueDate=:dueDate, done=:done',
        ExpressionAttributeNames: { '#todoName': 'name' },
        ExpressionAttributeValues: {
          ':name': name,
          ':dueDate': dueDate,
          ':done': done
        }
      })
      .promise()
  }

  return { getAllTodos, createTodo, updateTodo }
}
