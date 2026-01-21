import {
  type NewType,
  type Result,
  type Eff,
  unsafeCoerce,
  unwrap,
  ok,
  err,
} from "./shared";

// Value Objects
export type TodoId = NewType<string, "TodoId">;
export type TodoTitle = NewType<string, "TodoTitle">;
export type TodoDescription = NewType<string, "TodoDescription">;
export type Priority = "Low" | "Medium" | "High";
export type Timestamp = NewType<Date, "Timestamp">;

export const TodoId = {
  generate: (): TodoId =>
    unsafeCoerce(
      `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ),
  parse: (v: string): Result<TodoId, string> =>
    v.startsWith("todo-") ? ok(unsafeCoerce(v)) : err("Invalid TodoId"),
  unwrap: (id: TodoId): string => unwrap(id),
};

export const TodoTitle = {
  create: (v: string): Result<TodoTitle, string> => {
    const t = v.trim();
    if (!t) return err("Title required");
    if (t.length > 100) return err("Title too long");
    return ok(unsafeCoerce(t));
  },
  unwrap: (t: TodoTitle): string => unwrap(t),
};

export const TodoDescription = {
  create: (v?: string): Result<TodoDescription | undefined, string> => {
    if (!v?.trim()) return ok(undefined);
    if (v.length > 500) return err("Description too long");
    return ok(unsafeCoerce(v.trim()));
  },
  unwrap: (d: TodoDescription): string => unwrap(d),
};

export const Priority = {
  create: (v?: string): Result<Priority, string> => {
    if (!v) return ok("Medium");
    if (["Low", "Medium", "High"].includes(v)) return ok(v as Priority);
    return err("Invalid priority");
  },
};

export const Timestamp = {
  now: (): Timestamp => unsafeCoerce(new Date()),
  toISO: (t: Timestamp): string => unwrap(t).toISOString(),
};

// Entity
export type ActiveTodo = {
  _tag: "Active";
  id: TodoId;
  title: TodoTitle;
  description?: TodoDescription;
  priority: Priority;
  createdAt: Timestamp;
};
export type CompletedTodo = Omit<ActiveTodo, "_tag"> & {
  _tag: "Completed";
  completedAt: Timestamp;
};
export type ArchivedTodo = {
  _tag: "Archived";
  id: TodoId;
  title: TodoTitle;
  description?: TodoDescription;
  priority: Priority;
  createdAt: Timestamp;
  archivedAt: Timestamp;
};
export type Todo = ActiveTodo | CompletedTodo | ArchivedTodo;

export const createTodo = (
  id: TodoId,
  title: TodoTitle,
  description: TodoDescription | undefined,
  priority: Priority,
): ActiveTodo => ({
  _tag: "Active",
  id,
  title,
  description,
  priority,
  createdAt: Timestamp.now(),
});

export const completeTodo = (t: ActiveTodo): CompletedTodo => ({
  ...t,
  _tag: "Completed",
  completedAt: Timestamp.now(),
});

export const reopenTodo = (t: CompletedTodo): ActiveTodo => ({
  id: t.id,
  title: t.title,
  description: t.description,
  priority: t.priority,
  createdAt: t.createdAt,
  _tag: "Active",
});

export const archiveTodo = (t: ActiveTodo | CompletedTodo): ArchivedTodo => ({
  id: t.id,
  title: t.title,
  description: t.description,
  priority: t.priority,
  createdAt: t.createdAt,
  _tag: "Archived",
  archivedAt: Timestamp.now(),
});

// DTO
export type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  createdAt: string;
  completedAt?: string;
  archivedAt?: string;
};
export const toDTO = (t: Todo): TodoDTO => ({
  id: TodoId.unwrap(t.id),
  title: TodoTitle.unwrap(t.title),
  description: t.description
    ? TodoDescription.unwrap(t.description)
    : undefined,
  priority: t.priority,
  status: t._tag,
  createdAt: Timestamp.toISO(t.createdAt),
  completedAt:
    t._tag === "Completed" ? Timestamp.toISO(t.completedAt) : undefined,
  archivedAt: t._tag === "Archived" ? Timestamp.toISO(t.archivedAt) : undefined,
});

// Events
export type TodoEvent = { type: string; todoId: TodoId; at: Timestamp };
export const TodoEvent = {
  created: (id: TodoId): TodoEvent => ({
    type: "Created",
    todoId: id,
    at: Timestamp.now(),
  }),
  completed: (id: TodoId): TodoEvent => ({
    type: "Completed",
    todoId: id,
    at: Timestamp.now(),
  }),
  reopened: (id: TodoId): TodoEvent => ({
    type: "Reopened",
    todoId: id,
    at: Timestamp.now(),
  }),
  archived: (id: TodoId): TodoEvent => ({
    type: "Archived",
    todoId: id,
    at: Timestamp.now(),
  }),
};

// Repository (signature)
export type TodoRepository = {
  findById: (id: TodoId) => Eff<Todo | undefined, never>;
  findAll: () => Eff<Todo[], never>;
  save: (t: Todo) => Eff<Todo, never>;
};
