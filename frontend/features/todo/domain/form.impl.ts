/**
 * Form state machine implementation
 */

import { ok, err } from "../../../../shared/index.impl";
import type { Result } from "../../../../shared/index.def";
import type {
  TodoFormInput,
  ValidationError,
  IdleForm,
  EditingForm,
  SubmittingForm,
  ErrorForm,
  TodoForm,
  FormGuards,
  FormTransitions,
  ValidateForm,
} from "./form.def";
import type { Priority } from "./todo.def";

/*
 *
 * Initial State Factory
 *
 */

export const emptyInput = (): TodoFormInput => ({
  title: "",
  description: "",
  priority: "Medium" as Priority,
});

export const initialForm = (): IdleForm => ({
  _tag: "Idle",
  input: emptyInput(),
});

/*
 *
 * Type Guards
 *
 */

export const formGuards: FormGuards = {
  isIdle: (form: TodoForm) => form._tag === "Idle",
  isEditing: (form: TodoForm) => form._tag === "Editing",
  isSubmitting: (form: TodoForm) => form._tag === "Submitting",
  isSuccess: (form: TodoForm) => form._tag === "Success",
  isError: (form: TodoForm) => form._tag === "Error",
  canSubmit: (form: TodoForm) =>
    (form._tag === "Editing" || form._tag === "Error") && form.input.title.trim().length > 0,
};

/*
 *
 * State Transitions
 *
 */

export const formTransitions: FormTransitions = {
  edit: (form: IdleForm | ErrorForm, field: keyof TodoFormInput, value: string): EditingForm => {
    const touched =
      form._tag === "Error" ? new Set<keyof TodoFormInput>() : new Set<keyof TodoFormInput>();
    touched.add(field);
    return {
      _tag: "Editing",
      input: { ...form.input, [field]: value },
      touched,
    };
  },

  submit: (form: EditingForm | ErrorForm): SubmittingForm => ({
    _tag: "Submitting",
    input: form.input,
  }),

  succeed: (_form: SubmittingForm): SuccessForm => ({
    _tag: "Success",
    input: emptyInput(),
  }),

  fail: (form: SubmittingForm, errors: ValidationError[]): ErrorForm => ({
    _tag: "Error",
    input: form.input,
    errors,
  }),

  reset: (_form: TodoForm): IdleForm => initialForm(),
};

/*
 *
 * Validation
 *
 */

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export const validateForm: ValidateForm = (
  input: TodoFormInput,
): Result<TodoFormInput, ValidationError[]> => {
  const errors: ValidationError[] = [];

  const title = input.title.trim();
  if (title.length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.push({
      field: "title",
      message: `Title must be ${TITLE_MAX_LENGTH} characters or less`,
    });
  }

  const description = input.description.trim();
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: "description",
      message: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`,
    });
  }

  return errors.length > 0 ? err(errors) : ok(input);
};

/*
 *
 * Error Helpers
 *
 */

export const getFieldError = (form: TodoForm, field: keyof TodoFormInput): string | undefined => {
  if (form._tag !== "Error") return undefined;
  return form.errors.find((e) => e.field === field)?.message;
};

export const hasFieldError = (form: TodoForm, field: keyof TodoFormInput): boolean => {
  return getFieldError(form, field) !== undefined;
};
