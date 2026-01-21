<script setup lang="ts">
import type { Todo, FilteredTodos } from "./domain/todo.def";
import { unwrapId } from "./domain/todo.impl";
import TodoItem from "./TodoItem.vue";

defineProps<{
  filtered: FilteredTodos;
  isLoading: boolean;
  hasData: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  retry: [];
  complete: [todo: Todo];
  reopen: [todo: Todo];
  archive: [todo: Todo];
}>();
</script>

<template>
  <section class="todo-list">
    <h2>Todos ({{ filtered.todos.length }})</h2>

    <div v-if="isLoading && !hasData" class="loading">Loading...</div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button type="button" @click="emit('retry')">Retry</button>
    </div>

    <div v-else-if="filtered.todos.length === 0" class="empty">No todos found</div>

    <TodoItem
      v-for="todo in filtered.todos"
      v-else
      :key="unwrapId(todo.id)"
      :todo="todo"
      @complete="emit('complete', $event)"
      @reopen="emit('reopen', $event)"
      @archive="emit('archive', $event)"
    />
  </section>
</template>

<style scoped>
.todo-list {
  margin-bottom: 30px;
}

.loading,
.empty,
.error-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.error-state {
  color: #e74c3c;

  button {
    margin-top: 10px;
  }
}
</style>
