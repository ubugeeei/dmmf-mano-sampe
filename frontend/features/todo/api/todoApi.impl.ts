/**
 * Todo API client implementation
 *
 * Wraps fetch calls with Result type for explicit error handling.
 */

import { ok, err } from "#shared";
import type { Result } from "#shared";
import type { Todo, ActiveTodo, CompletedTodo, ArchivedTodo } from "../domain/todo.def";
import type {
  TodoApi,
  ApiError,
  CreateTodoRequest,
  TodoDTO,
  NetworkError,
  ValidationApiError,
} from "./todoApi.def";
import { fromDTO } from "../domain/todo.impl";

/*
 *
 * Error Constructors
 *
 */

const networkError = (message: string): NetworkError => ({
  _tag: "NetworkError",
  message,
});

const validationError = (errors: { field: string; message: string }[]): ValidationApiError => ({
  _tag: "ValidationError",
  errors,
});

/*
 *
 * API Client Implementation
 *
 */

export const createTodoApi = ($fetch: typeof globalThis.$fetch): TodoApi => ({
  fetchAll: async (): Promise<Result<Todo[], ApiError>> => {
    try {
      const dtos = await $fetch<TodoDTO[]>("/api/todos");
      return ok(dtos.map(fromDTO));
    } catch (e: unknown) {
      return err(networkError(e instanceof Error ? e.message : "Failed to fetch todos"));
    }
  },

  create: async (req: CreateTodoRequest): Promise<Result<ActiveTodo, ApiError>> => {
    try {
      const dto = await $fetch<TodoDTO>("/api/todos", {
        method: "POST",
        body: req,
      });
      return ok(fromDTO(dto) as ActiveTodo);
    } catch (e: unknown) {
      if (isValidationError(e)) {
        return err(validationError(e.data?.data ?? []));
      }
      return err(networkError(e instanceof Error ? e.message : "Failed to create todo"));
    }
  },

  complete: async (id: string): Promise<Result<CompletedTodo, ApiError>> => {
    try {
      const dto = await $fetch<TodoDTO>(`/api/todos/${id}/complete`, {
        method: "POST",
      });
      return ok(fromDTO(dto) as CompletedTodo);
    } catch (e: unknown) {
      return err(networkError(e instanceof Error ? e.message : "Failed to complete todo"));
    }
  },

  reopen: async (id: string): Promise<Result<ActiveTodo, ApiError>> => {
    try {
      const dto = await $fetch<TodoDTO>(`/api/todos/${id}/reopen`, {
        method: "POST",
      });
      return ok(fromDTO(dto) as ActiveTodo);
    } catch (e: unknown) {
      return err(networkError(e instanceof Error ? e.message : "Failed to reopen todo"));
    }
  },

  archive: async (id: string): Promise<Result<ArchivedTodo, ApiError>> => {
    try {
      const dto = await $fetch<TodoDTO>(`/api/todos/${id}/archive`, {
        method: "POST",
      });
      return ok(fromDTO(dto) as ArchivedTodo);
    } catch (e: unknown) {
      return err(networkError(e instanceof Error ? e.message : "Failed to archive todo"));
    }
  },
});

/*
 *
 * Type Guard for Validation Errors
 *
 */

type FetchError = {
  data?: {
    data?: { field: string; message: string }[];
  };
};

const isValidationError = (e: unknown): e is FetchError => {
  return (
    typeof e === "object" &&
    e !== null &&
    "data" in e &&
    typeof (e as FetchError).data === "object" &&
    (e as FetchError).data !== null &&
    "data" in (e as FetchError).data! &&
    Array.isArray((e as FetchError).data!.data)
  );
};
