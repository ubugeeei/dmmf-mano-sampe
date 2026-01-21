<script setup lang="ts">
import type { Priority } from "./domain/todo.def";
import type { ValidationError } from "./domain/form.def";

defineProps<{
  title: string;
  description: string;
  priority: Priority;
  isSubmitting: boolean;
  canSubmit: boolean;
  titleError?: string;
  descriptionError?: string;
  errors: ValidationError[];
}>();

const emit = defineEmits<{
  "update:title": [value: string];
  "update:description": [value: string];
  "update:priority": [value: Priority];
  submit: [];
}>();
</script>

<template>
  <section class="create-form">
    <h2>Create New Todo</h2>
    <form @submit.prevent="emit('submit')">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          type="text"
          :value="title"
          placeholder="Todo title (required, max 100 chars)"
          :disabled="isSubmitting"
          :class="{ error: titleError }"
          @input="emit('update:title', ($event.target as HTMLInputElement).value)"
        />
        <span v-if="titleError" class="field-error">{{ titleError }}</span>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          :value="description"
          placeholder="Detailed description (optional, max 500 chars)"
          rows="2"
          :disabled="isSubmitting"
          :class="{ error: descriptionError }"
          @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
        />
        <span v-if="descriptionError" class="field-error">{{ descriptionError }}</span>
      </div>

      <div class="form-group">
        <label for="priority">Priority</label>
        <select
          id="priority"
          :value="priority"
          :disabled="isSubmitting"
          @change="emit('update:priority', ($event.target as HTMLSelectElement).value as Priority)"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div v-if="errors.some((e) => e.field === 'general')" class="errors">
        <p
          v-for="error in errors.filter((e) => e.field === 'general')"
          :key="error.message"
          class="error"
        >
          {{ error.message }}
        </p>
      </div>

      <button type="submit" :disabled="!canSubmit || isSubmitting">
        {{ isSubmitting ? "Creating..." : "Create Todo" }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.create-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  input.error,
  textarea.error {
    border-color: #e74c3c;
  }
}

.field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.errors {
  background: #fee;
  border: 1px solid #fcc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.error {
  color: #c00;
  margin: 5px 0;
}
</style>
