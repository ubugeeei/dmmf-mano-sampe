/**
 * POST /api/todos - Todo作成（CreateTodoワークフロー）
 */

import { createTodoWorkflow } from '../../domain/workflows';
import { storage } from '../../utils/storage';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const result = createTodoWorkflow({
    title: body.title ?? '',
    description: body.description,
    priority: body.priority,
  });

  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: result.error,
    });
  }

  // 永続化（端に追いやる - 本書 第12章）
  storage.save(result.value.todo);

  // イベントをログ出力（本来はイベントバスに発行）
  console.log('[Event]', result.value.event.type, result.value.todo.id);

  return result.value.todo;
});
