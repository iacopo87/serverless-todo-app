import { TodoItem } from '../models/index'
import { CreateTodoRequest } from '../requests/index'
import { makeTodoAccess } from '../dataLayer/makeTodoAccess'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('businessLogic')
const todoAcces = makeTodoAccess()

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
