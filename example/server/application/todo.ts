import { Eff, ok, err } from "../domain/shared";
import {
  TodoId,
  TodoTitle,
  TodoDescription,
  Priority,
  createTodo,
  completeTodo,
  reopenTodo,
  archiveTodo,
  toDTO,
  TodoEvent,
  type TodoRepository,
  type TodoDTO,
  type Todo,
} from "../domain/todo";
import type { UoW } from "./uow";

type WorkflowError = {
  type: string;
  message: string;
  errors?: { field: string; message: string }[];
};

// Commands (Workflows)
export const createTodoWorkflow =
  (repo: TodoRepository) =>
  (
    input: { title: string; description?: string; priority?: string },
    uow: UoW,
  ) => {
    const title = TodoTitle.create(input.title);
    const desc = TodoDescription.create(input.description);
    const prio = Priority.create(input.priority);

    const errs = [
      !title.ok ? { field: "title", message: title.error } : [],
      !desc.ok ? { field: "description", message: desc.error } : [],
      !prio.ok ? { field: "priority", message: prio.error } : [],
    ].flat();

    if (errs.length) {
      return Eff.fail<WorkflowError>({
        type: "Validation",
        message: "Validation failed",
        errors: errs,
      });
    }

    const todo = createTodo(
      TodoId.generate(),
      title.value,
      desc.value,
      prio.value,
    );

    return Eff.map(repo.save(todo), (t) => {
      uow.events.push(TodoEvent.created(t.id));
      return toDTO(t);
    });
  };

export const completeTodoWorkflow =
  (repo: TodoRepository) => (todoId: string, uow: UoW) => {
    const id = TodoId.parse(todoId);
    if (!id.ok) {
      return Eff.fail<WorkflowError>({
        type: "InvalidId",
        message: id.error,
      });
    }

    return Eff.flatMap(repo.findById(id.value), (t) => {
      if (!t) {
        return Eff.fail<WorkflowError>({
          type: "NotFound",
          message: "Not found",
        });
      }
      if (t._tag !== "Active") {
        return Eff.fail<WorkflowError>({
          type: "InvalidState",
          message: "Not active",
        });
      }
      const done = completeTodo(t);
      return Eff.map(repo.save(done), (s) => {
        uow.events.push(TodoEvent.completed(s.id));
        return toDTO(s);
      });
    });
  };

export const reopenTodoWorkflow =
  (repo: TodoRepository) => (todoId: string, uow: UoW) => {
    const id = TodoId.parse(todoId);
    if (!id.ok)
      return Eff.fail<WorkflowError>({
        type: "InvalidId",
        message: id.error,
      });

    return Eff.flatMap(repo.findById(id.value), (t) => {
      if (!t)
        return Eff.fail<WorkflowError>({
          type: "NotFound",
          message: "Not found",
        });
      if (t._tag !== "Completed") {
        return Eff.fail<WorkflowError>({
          type: "InvalidState",
          message: "Not completed",
        });
      }
      const reopened = reopenTodo(t);
      return Eff.map(repo.save(reopened), (s) => {
        uow.events.push(TodoEvent.reopened(s.id));
        return toDTO(s);
      });
    });
  };

export const archiveTodoWorkflow =
  (repo: TodoRepository) => (todoId: string, uow: UoW) => {
    const id = TodoId.parse(todoId);
    if (!id.ok)
      return Eff.fail<WorkflowError>({
        type: "InvalidId",
        message: id.error,
      });

    return Eff.flatMap(repo.findById(id.value), (t) => {
      if (!t)
        return Eff.fail<WorkflowError>({
          type: "NotFound",
          message: "Not found",
        });
      if (t._tag === "Archived")
        return Eff.fail<WorkflowError>({
          type: "InvalidState",
          message: "Already archived",
        });
      const archived = archiveTodo(t);
      return Eff.map(repo.save(archived), (s) => {
        uow.events.push(TodoEvent.archived(s.id));
        return toDTO(s);
      });
    });
  };

// Queries
export const getAllTodos =
  (repo: TodoRepository) =>
  (excludeArchived = true) =>
    Eff.map(repo.findAll(), (todos) =>
      todos
        .filter((t) => !excludeArchived || t._tag !== "Archived")
        .sort((a, b) => +b.createdAt - +a.createdAt)
        .map(toDTO),
    );
