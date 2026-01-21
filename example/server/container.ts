import { createEventBus } from "./infrastructure/eventBus";
import { createTodoRepository } from "./infrastructure/todoRepository";
import { createUoW } from "./application/uow";
import {
  createTodoWorkflow,
  completeTodoWorkflow,
  reopenTodoWorkflow,
  archiveTodoWorkflow,
  getAllTodos,
} from "./application/todo";

const repo = createTodoRepository();
const bus = createEventBus();

bus.subscribe((e) => console.log(`[Event] ${e.type}:`, e.todoId));

export const container = {
  repo,
  bus,
  createUoW: () => createUoW(bus),
  // queries
  getAllTodos: getAllTodos(repo),

  // commands
  createTodo: createTodoWorkflow(repo),
  completeTodo: completeTodoWorkflow(repo),
  reopenTodo: reopenTodoWorkflow(repo),
  archiveTodo: archiveTodoWorkflow(repo),
};
