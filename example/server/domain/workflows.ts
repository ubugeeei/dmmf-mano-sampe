/**
 * ワークフロー - 本書 第7章、第9章
 *
 * ワークフロー = 入力を受け取り、検証し、イベントを出力する関数
 */

import type { Result } from './result';
import { ok, err } from './result';
import {
  createTodoId,
  createTodoTitle,
  createTodoDescription,
  createPriority,
  parseTodoId,
} from './valueObjects';
import {
  type ActiveTodo,
  type CompletedTodo,
  type Todo,
  type TodoCreatedEvent,
  type TodoCompletedEvent,
  type TodoReopenedEvent,
  type TodoArchivedEvent,
  completeTodo,
  reopenTodo,
  archiveTodo,
} from './todo';

// ============================================
// CreateTodo ワークフロー
// ============================================

export type CreateTodoInput = {
  title: string;
  description?: string;
  priority?: string;
};

export type CreateTodoError = { field: string; message: string }[];

export const createTodoWorkflow = (
  input: CreateTodoInput
): Result<{ todo: ActiveTodo; event: TodoCreatedEvent }, CreateTodoError> => {
  const errors: CreateTodoError = [];

  const titleResult = createTodoTitle(input.title);
  if (!titleResult.ok) errors.push({ field: 'title', message: titleResult.error });

  const descResult = createTodoDescription(input.description);
  if (!descResult.ok) errors.push({ field: 'description', message: descResult.error });

  const priorityResult = createPriority(input.priority);
  if (!priorityResult.ok) errors.push({ field: 'priority', message: priorityResult.error });

  if (errors.length > 0) return err(errors);

  // すべてokなので安全にアクセス
  const title = (titleResult as { ok: true; value: typeof titleResult extends { ok: true; value: infer V } ? V : never }).value;
  const description = (descResult as { ok: true; value: typeof descResult extends { ok: true; value: infer V } ? V : never }).value;
  const priority = (priorityResult as { ok: true; value: typeof priorityResult extends { ok: true; value: infer V } ? V : never }).value;

  const todo: ActiveTodo = {
    status: 'Active',
    id: createTodoId(),
    title,
    description,
    priority,
    createdAt: new Date(),
  };

  return ok({ todo, event: { type: 'TodoCreated', todo } });
};

// ============================================
// CompleteTodo ワークフロー
// ============================================

export const completeTodoWorkflow = (
  todos: Todo[],
  todoId: string
): Result<{ todo: CompletedTodo; event: TodoCompletedEvent }, string> => {
  const idResult = parseTodoId(todoId);
  if (!idResult.ok) return err(idResult.error);

  const todo = todos.find((t) => t.id === idResult.value);
  if (!todo) return err('Todoが見つかりません');
  if (todo.status !== 'Active') return err('アクティブなTodoのみ完了できます');

  const completed = completeTodo(todo);
  return ok({ todo: completed, event: { type: 'TodoCompleted', todo: completed } });
};

// ============================================
// ReopenTodo ワークフロー
// ============================================

export const reopenTodoWorkflow = (
  todos: Todo[],
  todoId: string
): Result<{ todo: ActiveTodo; event: TodoReopenedEvent }, string> => {
  const idResult = parseTodoId(todoId);
  if (!idResult.ok) return err(idResult.error);

  const todo = todos.find((t) => t.id === idResult.value);
  if (!todo) return err('Todoが見つかりません');
  if (todo.status !== 'Completed') return err('完了したTodoのみ再開できます');

  const reopened = reopenTodo(todo);
  return ok({ todo: reopened, event: { type: 'TodoReopened', todo: reopened } });
};

// ============================================
// ArchiveTodo ワークフロー
// ============================================

export const archiveTodoWorkflow = (
  todos: Todo[],
  todoId: string
): Result<{ todo: typeof archiveTodo extends (t: any) => infer R ? R : never; event: TodoArchivedEvent }, string> => {
  const idResult = parseTodoId(todoId);
  if (!idResult.ok) return err(idResult.error);

  const todo = todos.find((t) => t.id === idResult.value);
  if (!todo) return err('Todoが見つかりません');
  if (todo.status === 'Archived') return err('既にアーカイブ済みです');

  const archived = archiveTodo(todo);
  return ok({ todo: archived, event: { type: 'TodoArchived', todo: archived } });
};
