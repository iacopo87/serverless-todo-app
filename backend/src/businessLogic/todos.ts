import { TodoItem } from '../models/index'
import { CreateTodoRequest, UpdateTodoRequest } from '../requests/index'
import { makeTodoAccess, makeDBAccess } from '../dataLayer/index'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('businessLogic')
const todoAcces = makeTodoAccess()
const dbAccess = makeDBAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Get all user todos', userId)

  return todoAcces.getAllTodos(userId)
}

export async function createTodo(
  userId: string,
  request: CreateTodoRequest
): Promise<TodoItem> {
  logger.info('Create Todo', request)

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newItem = {
    todoId,
    userId,
    createdAt,
    done: false,
    ...request
  }

  return todoAcces.createTodo(newItem)
}

export async function updateTodo(todoId: string, request: UpdateTodoRequest) {
  logger.info('Update Todo', request)

  return todoAcces.updateTodo(todoId, request)
}

export async function deleteTodo(todoId: string) {
  logger.info('Delete Todo', todoId)

  return todoAcces.deleteTodo(todoId)
}

export async function getUploadUrl(todoId: string): Promise<String> {
  logger.info('Get upload url', todoId)

  const imageId = uuid.v4()
  const uploadUrl = dbAccess.getUploadUrl(imageId)

  await todoAcces.createImage(imageId, todoId)

  return uploadUrl
}
