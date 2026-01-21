/**
 * POST /api/todos/:id/reopen - Todo再開（ReopenTodoワークフロー）
 */

import { reopenTodoWorkflow } from '../../../domain/workflows';
import { storage } from '../../../utils/storage';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  const todos = storage.getAll();

  const result = reopenTodoWorkflow(todos, id);

  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error,
    });
  }

  storage.save(result.value.todo);
  console.log('[Event]', result.value.event.type, result.value.todo.id);

  return result.value.todo;
});
