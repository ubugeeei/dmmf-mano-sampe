import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createTodoWorkflow,
  completeTodoWorkflow,
  reopenTodoWorkflow,
  archiveTodoWorkflow,
  getAllTodos,
} from "./todo";
import { createTodoRepository } from "../infrastructure/todoRepository";
import { createEventBus } from "../infrastructure/eventBus";
import { createUoW } from "./uow";
import {
  TodoId,
  TodoTitle,
  Timestamp,
  createTodo,
  completeTodo,
} from "../domain/todo";
import type { CompletedTodo, ArchivedTodo } from "../domain/todo";

describe("createTodoWorkflow", () => {
  const setup = () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const workflow = createTodoWorkflow(repo);
    const uow = createUoW(bus);
    return { repo, bus, workflow, uow };
  };

  it("creates todo with valid input", async () => {
    const { workflow, uow } = setup();
    const r = await workflow({ title: "Test", priority: "High" }, uow).run();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.title).toBe("Test");
      expect(r.value.priority).toBe("High");
      expect(r.value.status).toBe("Active");
    }
    expect(uow.events).toHaveLength(1);
    expect(uow.events[0]!.type).toBe("Created");
  });

  it("fails with empty title", async () => {
    const { workflow, uow } = setup();
    const r = await workflow({ title: "" }, uow).run();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.type).toBe("Validation");
      expect(r.error.errors).toContainEqual({
        field: "title",
        message: "Title required",
      });
    }
  });

  it("fails with invalid priority", async () => {
    const { workflow, uow } = setup();
    const r = await workflow({ title: "Test", priority: "Invalid" }, uow).run();
    expect(r.ok).toBe(false);
  });
});

describe("completeTodoWorkflow", () => {
  const setup = async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    return {
      repo,
      bus,
      id: TodoId.unwrap(id),
      workflow: completeTodoWorkflow(repo),
    };
  };

  it("completes active todo", async () => {
    const { bus, id, workflow } = await setup();
    const uow = createUoW(bus);
    const r = await workflow(id, uow).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Completed");
    expect(uow.events).toHaveLength(1);
    expect(uow.events[0]!.type).toBe("Completed");
  });

  it("fails for non-existent todo", async () => {
    const { bus, workflow } = await setup();
    const uow = createUoW(bus);
    const r = await workflow("todo-nonexistent-abc", uow).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.type).toBe("NotFound");
  });

  it("fails for invalid id format", async () => {
    const { bus, workflow } = await setup();
    const uow = createUoW(bus);
    const r = await workflow("invalid", uow).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.type).toBe("InvalidId");
  });
});

describe("reopenTodoWorkflow", () => {
  const setup = async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    const completed = completeTodo(todo);
    await repo.save(completed).run();
    return {
      repo,
      bus,
      id: TodoId.unwrap(id),
      workflow: reopenTodoWorkflow(repo),
    };
  };

  it("reopens completed todo", async () => {
    const { bus, id, workflow } = await setup();
    const uow = createUoW(bus);
    const r = await workflow(id, uow).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Active");
    expect(uow.events[0]!.type).toBe("Reopened");
  });

  it("fails for active todo", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    const uow = createUoW(bus);
    const r = await reopenTodoWorkflow(repo)(TodoId.unwrap(id), uow).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.type).toBe("InvalidState");
  });
});

describe("archiveTodoWorkflow", () => {
  it("archives active todo", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    const uow = createUoW(bus);
    const r = await archiveTodoWorkflow(repo)(TodoId.unwrap(id), uow).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Archived");
  });

  it("fails for already archived", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    const archived: ArchivedTodo = {
      _tag: "Archived",
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      createdAt: todo.createdAt,
      archivedAt: Timestamp.now(),
    };
    await repo.save(archived).run();
    const uow = createUoW(bus);
    const r = await archiveTodoWorkflow(repo)(TodoId.unwrap(id), uow).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.type).toBe("InvalidState");
  });
});

describe("getAllTodos", () => {
  it("returns all todos sorted by createdAt", async () => {
    const repo = createTodoRepository();
    const title1 = TodoTitle.create("First");
    const title2 = TodoTitle.create("Second");
    if (!title1.ok || !title2.ok) throw new Error();

    const todo1 = createTodo(TodoId.generate(), title1.value, undefined, "Low");
    await new Promise((r) => setTimeout(r, 10));
    const todo2 = createTodo(
      TodoId.generate(),
      title2.value,
      undefined,
      "High",
    );

    await repo.save(todo1).run();
    await repo.save(todo2).run();

    const r = await getAllTodos(repo)(false).run();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toHaveLength(2);
      expect(r.value[0]!.title).toBe("Second");
    }
  });

  it("excludes archived by default", async () => {
    const repo = createTodoRepository();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(
      TodoId.generate(),
      title.value,
      undefined,
      "Medium",
    );
    const archived: ArchivedTodo = {
      _tag: "Archived",
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      createdAt: todo.createdAt,
      archivedAt: Timestamp.now(),
    };
    await repo.save(archived).run();

    const r = await getAllTodos(repo)(true).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(0);
  });
});
