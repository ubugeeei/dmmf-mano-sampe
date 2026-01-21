/**
 * Todo API client type definitions
 *
 * All API operations return Result types, making error handling explicit.
 * No exceptions are thrown - errors are values.
 */

import type { Result } from "../../../../shared/index.def";
import type { Todo, ActiveTodo, CompletedTodo, ArchivedTodo, Priority } from "../domain/todo.def";

/*
 *
 * API Error Types
 *
 */

export type NetworkError = {
  _tag: "NetworkError";
  message: string;
};

export type ValidationApiError = {
  _tag: "ValidationError";
  errors: { field: string; message: string }[];
};

export type NotFoundError = {
  _tag: "NotFoundError";
  id: string;
};

export type ApiError = NetworkError | ValidationApiError | NotFoundError;

/*
 *
 * Request/Response DTOs
 *
 */

export type CreateTodoRequest = {
  title: string;
  description?: string;
  priority?: Priority;
};

export type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  createdAt: string;
  completedAt?: string;
  archivedAt?: string;
};

/*
 *
 * API Client Interface
 *
 */

export type TodoApi = {
  /**
   * Fetch all todos (excludes archived)
   */
  fetchAll: () => Promise<Result<Todo[], ApiError>>;

  /**
   * Create a new todo
   */
  create: (req: CreateTodoRequest) => Promise<Result<ActiveTodo, ApiError>>;

  /**
   * Mark an active todo as completed
   */
  complete: (id: string) => Promise<Result<CompletedTodo, ApiError>>;

  /**
   * Reopen a completed todo
   */
  reopen: (id: string) => Promise<Result<ActiveTodo, ApiError>>;

  /**
   * Archive a todo (terminal state)
   */
  archive: (id: string) => Promise<Result<ArchivedTodo, ApiError>>;
};
