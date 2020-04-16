import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem, TodoUpdate } from '../models/index'
import { createLogger } from '../utils/logger'

const logger = createLogger('todoAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export function makeTodoAccess(
  documentClient = new XAWS.DynamoDB.DocumentClient(),
  todoTable = process.env.TODO_TABLE,
  userIdIndex = process.env.USER_ID_INDEX,
  bucketName = process.env.IMAGES_S3_BUCKET
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

  const deleteTodo = async function (todoId: String): Promise<void> {
    logger.info('Delete todo item..', todoId)

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
      .delete({
        TableName: todoTable,
        Key: { todoId, createdAt: queryResult.Items[0].createdAt }
      })
      .promise()
  }

  const createImage = async function (imageId: String, todoId: String) {
    logger.info('Creating image', imageId, todoId)

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

    return documentClient
      .update({
        TableName: todoTable,
        Key: { todoId, createdAt: queryResult.Items[0].createdAt },
        UpdateExpression: 'set attachmentUrl=:attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${imageId}`
        }
      })
      .promise()
  }

  return {
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    createImage
  }
}
