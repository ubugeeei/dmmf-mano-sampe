<script setup lang="ts">
import type { TodoFilter, FilteredTodos } from "./domain/todo.def";

defineProps<{
  currentFilter: TodoFilter;
  counts: FilteredTodos["counts"];
}>();

const emit = defineEmits<{
  change: [filter: TodoFilter];
}>();
</script>

<template>
  <section class="filters">
    <button
      type="button"
      :class="{ active: currentFilter === 'all' }"
      @click="emit('change', 'all')"
    >
      All ({{ counts.all }})
    </button>
    <button
      type="button"
      :class="{ active: currentFilter === 'active' }"
      @click="emit('change', 'active')"
    >
      Active ({{ counts.active }})
    </button>
    <button
      type="button"
      :class="{ active: currentFilter === 'completed' }"
      @click="emit('change', 'completed')"
    >
      Completed ({{ counts.completed }})
    </button>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
    border-radius: 4px;

    &.active {
      background: #007bff;
      color: #fff;
      border-color: #007bff;
    }
  }
}
</style>
