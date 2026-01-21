/**
 * Form state transitions represented as types
 *
 * State Transitions:
 *   Idle -[input]-> Editing
 *   Editing -[submit]-> Submitting
 *   Submitting -[success]-> Success -> Idle
 *   Submitting -[error]-> Error
 *   Error -[input]-> Editing
 *   Error -[retry]-> Submitting
 */

import type { Result } from "../../../../shared/index.def";
import type { Priority } from "./todo.def";

/*
 *
 * Form Input (Unvalidated)
 *
 */

export type TodoFormInput = {
  title: string;
  description: string;
  priority: Priority;
};

/*
 *
 * Validation Error
 *
 */

export type ValidationError = {
  field: keyof TodoFormInput | "general";
  message: string;
};

/*
 *
 * Form States
 *
 */

export type IdleForm = {
  _tag: "Idle";
  input: TodoFormInput;
};

export type EditingForm = {
  _tag: "Editing";
  input: TodoFormInput;
  touched: Set<keyof TodoFormInput>;
};

export type SubmittingForm = {
  _tag: "Submitting";
  input: TodoFormInput;
};

export type SuccessForm = {
  _tag: "Success";
  input: TodoFormInput;
};

export type ErrorForm = {
  _tag: "Error";
  input: TodoFormInput;
  errors: ValidationError[];
};

export type TodoForm = IdleForm | EditingForm | SubmittingForm | SuccessForm | ErrorForm;

/*
 *
 * State Guards
 *
 */

export type FormGuards = {
  isIdle: (form: TodoForm) => boolean;
  isEditing: (form: TodoForm) => boolean;
  isSubmitting: (form: TodoForm) => boolean;
  isSuccess: (form: TodoForm) => boolean;
  isError: (form: TodoForm) => boolean;
  canSubmit: (form: TodoForm) => boolean;
};

/*
 *
 * State Transitions
 *
 */

export type FormTransitions = {
  edit: (form: IdleForm | ErrorForm, field: keyof TodoFormInput, value: string) => EditingForm;
  submit: (form: EditingForm | ErrorForm) => SubmittingForm;
  succeed: (form: SubmittingForm) => SuccessForm;
  fail: (form: SubmittingForm, errors: ValidationError[]) => ErrorForm;
  reset: (form: TodoForm) => IdleForm;
};

/*
 *
 * Validation
 *
 */

export type ValidateForm = (input: TodoFormInput) => Result<TodoFormInput, ValidationError[]>;
