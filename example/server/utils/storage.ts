/**
 * インメモリストレージ（簡易的な永続化層）
 * 本書 第12章 - 永続化を端に追いやる
 */

import type { Todo } from '../domain/todo';

// サーバー側のインメモリストレージ
const todos: Map<string, Todo> = new Map();

export const storage = {
  getAll: (): Todo[] => Array.from(todos.values()),

  getById: (id: string): Todo | undefined => todos.get(id),

  save: (todo: Todo): void => {
    todos.set(todo.id, todo);
  },

  delete: (id: string): boolean => todos.delete(id),
};
