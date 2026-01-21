/**
 * Todo エンティティと状態遷移 - 本書 第5章、第7章
 *
 * Todoのライフサイクル（ステートマシン）:
 * - Active（アクティブ）
 * - Completed（完了）
 * - Archived（アーカイブ）
 */

import type { TodoId, TodoTitle, TodoDescription, Priority } from './valueObjects';

// ============================================
// Todoの状態（判別共用体）
// ============================================

export type ActiveTodo = {
  readonly status: 'Active';
  readonly id: TodoId;
  readonly title: TodoTitle;
  readonly description?: TodoDescription;
  readonly priority: Priority;
  readonly createdAt: Date;
};

export type CompletedTodo = {
  readonly status: 'Completed';
  readonly id: TodoId;
  readonly title: TodoTitle;
  readonly description?: TodoDescription;
  readonly priority: Priority;
  readonly createdAt: Date;
  readonly completedAt: Date;
};

export type ArchivedTodo = {
  readonly status: 'Archived';
  readonly id: TodoId;
  readonly title: TodoTitle;
  readonly description?: TodoDescription;
  readonly priority: Priority;
  readonly createdAt: Date;
  readonly archivedAt: Date;
};

export type Todo = ActiveTodo | CompletedTodo | ArchivedTodo;

// ============================================
// 状態遷移関数（型で遷移を制約）
// ============================================

export const completeTodo = (todo: ActiveTodo): CompletedTodo => ({
  ...todo,
  status: 'Completed',
  completedAt: new Date(),
});

export const reopenTodo = (todo: CompletedTodo): ActiveTodo => {
  const { completedAt, ...rest } = todo;
  return { ...rest, status: 'Active' };
};

export const archiveTodo = (todo: ActiveTodo | CompletedTodo): ArchivedTodo => {
  const base = { ...todo, status: 'Archived' as const, archivedAt: new Date() };
  if ('completedAt' in base) {
    const { completedAt, ...rest } = base;
    return rest;
  }
  return base;
};

// ============================================
// ドメインイベント - 本書 第1章
// ============================================

export type TodoCreatedEvent = { type: 'TodoCreated'; todo: ActiveTodo };
export type TodoCompletedEvent = { type: 'TodoCompleted'; todo: CompletedTodo };
export type TodoReopenedEvent = { type: 'TodoReopened'; todo: ActiveTodo };
export type TodoArchivedEvent = { type: 'TodoArchived'; todo: ArchivedTodo };

export type TodoEvent =
  | TodoCreatedEvent
  | TodoCompletedEvent
  | TodoReopenedEvent
  | TodoArchivedEvent;
