/**
 * 値オブジェクト - 本書 第5章、第6章
 * プリミティブ型ではなく、制約を持つ専用の型で表現
 */

import type { Result } from './result';
import { ok, err } from './result';

// ============================================
// TodoId
// ============================================
export type TodoId = string & { readonly _brand: unique symbol };

export const createTodoId = (): TodoId =>
  `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as TodoId;

export const parseTodoId = (id: string): Result<TodoId, string> =>
  id.startsWith('todo-') ? ok(id as TodoId) : err('無効なTodoIdです');

// ============================================
// TodoTitle (1〜100文字)
// ============================================
export type TodoTitle = string & { readonly _brand: unique symbol };

export const createTodoTitle = (value: string): Result<TodoTitle, string> => {
  const trimmed = value.trim();
  if (trimmed === '') return err('タイトルは必須です');
  if (trimmed.length > 100) return err('タイトルは100文字以内です');
  return ok(trimmed as TodoTitle);
};

// ============================================
// TodoDescription (0〜500文字)
// ============================================
export type TodoDescription = string & { readonly _brand: unique symbol };

export const createTodoDescription = (value: string | undefined): Result<TodoDescription | undefined, string> => {
  if (!value || value.trim() === '') return ok(undefined);
  const trimmed = value.trim();
  if (trimmed.length > 500) return err('説明は500文字以内です');
  return ok(trimmed as TodoDescription);
};

// ============================================
// Priority (Low | Medium | High)
// ============================================
export type Priority = 'Low' | 'Medium' | 'High';

export const createPriority = (value: string | undefined): Result<Priority, string> => {
  const v = value ?? 'Medium';
  if (v === 'Low' || v === 'Medium' || v === 'High') return ok(v);
  return err('優先度はLow/Medium/Highのいずれかです');
};
