<script setup lang="ts">
import type { Todo } from "./domain/todo.def";
import { todoGuards, priorityColor, unwrapTitle, unwrapDescription } from "./domain/todo.impl";

const props = defineProps<{
  todo: Todo;
}>();

const emit = defineEmits<{
  complete: [todo: Todo];
  reopen: [todo: Todo];
  archive: [todo: Todo];
}>();

const handleComplete = () => {
  if (todoGuards.isActive(props.todo)) {
    emit("complete", props.todo);
  }
};

const handleReopen = () => {
  if (todoGuards.isCompleted(props.todo)) {
    emit("reopen", props.todo);
  }
};

const handleArchive = () => {
  if (todoGuards.isActive(props.todo) || todoGuards.isCompleted(props.todo)) {
    emit("archive", props.todo);
  }
};
</script>

<template>
  <article class="todo-item" :class="todo.status.toLowerCase()">
    <div class="todo-header">
      <span class="priority" :style="{ backgroundColor: priorityColor(todo.priority) }">
        {{ todo.priority }}
      </span>
      <span class="status">{{ todo.status }}</span>
    </div>

    <h3 :class="{ completed: todo.status === 'Completed' }">
      {{ unwrapTitle(todo.title) }}
    </h3>

    <p v-if="todo.description" class="description">
      {{ unwrapDescription(todo.description) }}
    </p>

    <div class="todo-actions">
      <button v-if="todoGuards.isActive(todo)" type="button" @click="handleComplete">
        Complete
      </button>
      <button v-if="todoGuards.isCompleted(todo)" type="button" @click="handleReopen">
        Reopen
      </button>
      <button
        v-if="todoGuards.isActive(todo) || todoGuards.isCompleted(todo)"
        type="button"
        class="archive"
        @click="handleArchive"
      >
        Archive
      </button>
    </div>
  </article>
</template>

<style scoped>
.todo-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;

  &.completed {
    background: #f0fff0;
  }

  h3 {
    margin: 0 0 10px 0;

    &.completed {
      text-decoration: line-through;
      color: #999;
    }
  }
}

.todo-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.status {
  padding: 2px 8px;
  background: #eee;
  border-radius: 4px;
  font-size: 12px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.todo-actions {
  display: flex;
  gap: 10px;

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:not(.archive) {
      background: #28a745;
      color: #fff;
    }

    &.archive {
      background: #dc3545;
      color: #fff;
    }
  }
}
</style>
