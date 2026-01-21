import { succeed } from "#shared";
import type { Todo, TodoId, TodoRepository } from "../domain/todo.def";
import { todoId } from "../domain/todo.impl";

/*
 *
 * TodoRepository
 *
 */

export type CreateTodoRepository = () => TodoRepository;

export const createTodoRepository: CreateTodoRepository = () => {
  const store = new Map<string, Todo>();
  return {
    findById: (id: TodoId) => succeed(store.get(todoId.unwrap(id))),
    findAll: () => succeed([...store.values()]),
    save: (t: Todo) => {
      store.set(todoId.unwrap(t.id), t);
      return succeed(t);
    },
  };
};
