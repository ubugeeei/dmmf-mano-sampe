/**
 * Todo form composable
 */

import { ref, computed } from "vue";
import type { TodoForm, TodoFormInput, ValidationError } from "../domain/form.def";
import type { TodoApi } from "../api/todoApi.def";
import type { Priority } from "../domain/todo.def";
import {
  initialForm,
  formGuards,
  formTransitions,
  validateForm,
  getFieldError,
  emptyInput,
} from "../domain/form.impl";

export const useTodoForm = (api: TodoApi, onSuccess?: () => void) => {
  const form = ref<TodoForm>(initialForm());

  const derived = computed(() => ({
    title: form.value.input.title,
    description: form.value.input.description,
    priority: form.value.input.priority,
    isSubmitting: form.value._tag === "Submitting",
    canSubmit: formGuards.canSubmit(form.value),
    errors: form.value._tag === "Error" ? form.value.errors : [],
    titleError: getFieldError(form.value, "title"),
    descriptionError: getFieldError(form.value, "description"),
  }));

  const updateInput = (field: keyof TodoFormInput, value: string): void => {
    const current = form.value;
    if (current._tag === "Idle" || current._tag === "Error") {
      form.value = formTransitions.edit(current, field, value);
    } else if (current._tag === "Editing") {
      form.value = {
        ...current,
        input: { ...current.input, [field]: value },
        touched: new Set([...current.touched, field]),
      };
    }
  };

  const setTitle = (value: string) => updateInput("title", value);
  const setDescription = (value: string) => updateInput("description", value);
  const setPriority = (value: Priority): void => {
    const current = form.value;
    if (current._tag === "Idle" || current._tag === "Error" || current._tag === "Editing") {
      form.value = {
        _tag: "Editing",
        input: { ...current.input, priority: value },
        touched:
          current._tag === "Editing"
            ? new Set([...current.touched, "priority"])
            : new Set(["priority"]),
      };
    }
  };

  const submit = async (): Promise<boolean> => {
    const current = form.value;
    if (current._tag !== "Editing" && current._tag !== "Error") return false;

    const validationResult = validateForm(current.input);
    if (!validationResult.ok) {
      form.value = { _tag: "Error", input: current.input, errors: validationResult.error };
      return false;
    }

    form.value = formTransitions.submit(current);

    const result = await api.create({
      title: current.input.title.trim(),
      description: current.input.description.trim() || undefined,
      priority: current.input.priority,
    });

    if (result.ok) {
      form.value = { _tag: "Success", input: emptyInput() };
      setTimeout(() => {
        form.value = initialForm();
        onSuccess?.();
      }, 100);
      return true;
    }

    const apiErrors: ValidationError[] =
      result.error._tag === "ValidationError"
        ? result.error.errors.map((e) => ({
            field: e.field as keyof TodoFormInput | "general",
            message: e.message,
          }))
        : [
            {
              field: "general",
              message: "message" in result.error ? result.error.message : "Unknown error",
            },
          ];

    form.value = { _tag: "Error", input: current.input, errors: apiErrors };
    return false;
  };

  const reset = () => {
    form.value = formTransitions.reset(form.value);
  };

  return { form, derived, setTitle, setDescription, setPriority, submit, reset };
};
