/**
 * Todo list composable
 */

import { ref, computed } from "vue";
import type { Async } from "../domain/async.def";
import type { Todo, ActiveTodo, CompletedTodo, TodoFilter } from "../domain/todo.def";
import type { TodoApi } from "../api/todoApi.def";
import { asyncOps, asyncGuards } from "../domain/async.impl";
import { filterTodos, unwrapId } from "../domain/todo.impl";

export const useTodos = (api: TodoApi) => {
  const guards = asyncGuards<Todo[], string>();

  const state = ref<Async<Todo[], string>>(asyncOps.initial());
  const filter = ref<TodoFilter>("all");

  const derived = computed(() => {
    const todos = asyncOps.getOrElse(state.value, []);
    return {
      isLoading: guards.isPending(state.value),
      hasData: guards.hasData(state.value),
      error: guards.isError(state.value) ? state.value.error : undefined,
      filtered: filterTodos(todos, filter.value),
    };
  });

  const fetch = async () => {
    state.value = asyncOps.loading();
    const result = await api.fetchAll();
    state.value = result.ok ? asyncOps.success(result.value) : asyncOps.error(result.error.message);
  };

  const refresh = async () => {
    if (!guards.hasData(state.value)) return fetch();
    state.value = { _tag: "Refreshing", data: state.value.data, fetchedAt: new Date() };
    const result = await api.fetchAll();
    state.value = result.ok ? asyncOps.success(result.value) : asyncOps.error(result.error.message);
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
