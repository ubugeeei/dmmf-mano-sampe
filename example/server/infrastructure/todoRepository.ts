import { Eff } from "../domain/shared";
import type { Todo, TodoId, TodoRepository } from "../domain/todo";
import { TodoId as TID } from "../domain/todo";

export const createTodoRepository = (): TodoRepository => {
  const store = new Map<string, Todo>();
  return {
    findById: (id: TodoId) => Eff.succeed(store.get(TID.unwrap(id))),
    findAll: () => Eff.succeed([...store.values()]),
    save: (t: Todo) => {
      store.set(TID.unwrap(t.id), t);
      return Eff.succeed(t);
    },
  };
};
