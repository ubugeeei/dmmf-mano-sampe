/**
 * POST /api/todos/:id/complete - Todo完了（CompleteTodoワークフロー）
 */

import { completeTodoWorkflow } from '../../../domain/workflows';
import { storage } from '../../../utils/storage';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!;
  const todos = storage.getAll();

  const result = completeTodoWorkflow(todos, id);

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
