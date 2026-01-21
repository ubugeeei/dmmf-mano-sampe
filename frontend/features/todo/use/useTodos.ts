/**
 * Todo list composable
 */

import { ref, computed } from "vue";
import type { Async } from "../domain/async.def";
import type { Todo, ActiveTodo, CompletedTodo, TodoFilter } from "../domain/todo.def";
import type { TodoApi, ApiError } from "../api/todoApi.def";
import { asyncOps } from "../domain/async.impl";
import { filterTodos, unwrapId } from "../domain/todo.impl";

const getErrorMessage = (error: ApiError): string => {
  switch (error._tag) {
    case "NetworkError":
      return error.message;
    case "ValidationError":
      return error.errors.map((e) => e.message).join(", ");
    case "NotFoundError":
      return `Not found: ${error.id}`;
  }
};

export const useTodos = (api: TodoApi) => {
  const state = ref<Async<Todo[], string>>(asyncOps.initial());
  const filter = ref<TodoFilter>("all");

  const derived = computed(() => {
    const todos = asyncOps.getOrElse(state.value, []);
    return {
      isLoading: state.value._tag === "Loading" || state.value._tag === "Refreshing",
      hasData: state.value._tag === "Success" || state.value._tag === "Refreshing",
      error: state.value._tag === "Error" ? state.value.error : undefined,
      filtered: filterTodos(todos, filter.value),
    };
  });

  const fetch = async (): Promise<void> => {
    state.value = asyncOps.loading();
    const result = await api.fetchAll();
    state.value = result.ok
      ? asyncOps.success(result.value)
      : asyncOps.error(getErrorMessage(result.error));
  };

  const refresh = async (): Promise<void> => {
    const current = state.value;
    if (current._tag !== "Success" && current._tag !== "Refreshing") return fetch();
    state.value = { _tag: "Refreshing", data: current.data, fetchedAt: new Date() };
    const result = await api.fetchAll();
    state.value = result.ok
      ? asyncOps.success(result.value)
      : asyncOps.error(getErrorMessage(result.error));
  };

  const complete = async (todo: ActiveTodo) => {
    const result = await api.complete(unwrapId(todo.id));
    if (result.ok) await refresh();
  };

  const reopen = async (todo: CompletedTodo) => {
    const result = await api.reopen(unwrapId(todo.id));
    if (result.ok) await refresh();
  };

  const archive = async (todo: ActiveTodo | CompletedTodo) => {
    const result = await api.archive(unwrapId(todo.id));
    if (result.ok) await refresh();
  };

  const setFilter = (f: TodoFilter) => {
    filter.value = f;
  };

  return { state, filter, derived, fetch, refresh, complete, reopen, archive, setFilter };
};
