<script setup lang="ts">
/**
 * Main page - Todo application following DMMF principles
 *
 * - State machines: Form and Async states are explicit
 * - Type-safe actions: Operations are constrained by todo state
 * - Result types: Errors are values, not exceptions
 * - Colocation: All todo-related code in features/todo/
 */

import {
  createTodoApi,
  useTodos,
  useTodoForm,
  todoGuards,
  TodoForm,
  TodoFilters,
  TodoList,
} from "~/features/todo";
import type { Todo } from "~/features/todo";

const api = createTodoApi($fetch);
const todos = useTodos(api);
const form = useTodoForm(api, () => todos.refresh());

await todos.fetch();

const handleComplete = (todo: Todo) => {
  if (todoGuards.isActive(todo)) {
    todos.complete(todo);
  }
};

const handleReopen = (todo: Todo) => {
  if (todoGuards.isCompleted(todo)) {
    todos.reopen(todo);
  }
};

const handleArchive = (todo: Todo) => {
  if (todoGuards.isActive(todo) || todoGuards.isCompleted(todo)) {
    todos.archive(todo);
  }
};
</script>

<template>
  <div class="container">
    <header>
      <h1>DMMF Todo App</h1>
      <p>Functional Domain Modeling with TypeScript</p>
    </header>

    <TodoForm
      :title="form.derived.value.title"
      :description="form.derived.value.description"
      :priority="form.derived.value.priority"
      :is-submitting="form.derived.value.isSubmitting"
      :can-submit="form.derived.value.canSubmit"
      :title-error="form.derived.value.titleError"
      :description-error="form.derived.value.descriptionError"
      :errors="form.derived.value.errors"
      @update:title="form.setTitle"
      @update:description="form.setDescription"
      @update:priority="form.setPriority"
      @submit="form.submit"
    />

    <TodoFilters
      :current-filter="todos.filter.value"
      :counts="todos.derived.value.filtered.counts"
      @change="todos.setFilter"
    />

    <TodoList
      :filtered="todos.derived.value.filtered"
      :is-loading="todos.derived.value.isLoading"
      :has-data="todos.derived.value.hasData"
      :error="todos.derived.value.error"
      @retry="todos.fetch"
      @complete="handleComplete"
      @reopen="handleReopen"
      @archive="handleArchive"
    />

    <footer>
      <h2>DMMF Concepts Applied</h2>
      <ul>
        <li><strong>State Machines:</strong> Form and Async states are explicit types</li>
        <li>
          <strong>Make Illegal States Unrepresentable:</strong> Actions constrained by todo state
        </li>
        <li><strong>Result Types:</strong> Errors as values, not exceptions</li>
        <li><strong>Smart Constructors:</strong> Validated value objects</li>
        <li><strong>Colocation:</strong> Feature-based code organization</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;

  p {
    color: #666;
  }
}

footer {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;

  ul {
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
}
</style>
