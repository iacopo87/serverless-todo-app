import { TodoItem } from '../models/index'
import { makeTodoAccess } from '../dataLayer/makeTodoAccess'
import { createLogger } from '../utils/logger'

const logger = createLogger('businessLogic')
const todoAcces = makeTodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Get all user todos', userId)

  return todoAcces.getAllTodos(userId)
}
