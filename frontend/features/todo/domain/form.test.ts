import { describe, it, expect } from "vitest";
import {
  initialForm,
  emptyInput,
  formGuards,
  formTransitions,
  validateForm,
  getFieldError,
  hasFieldError,
} from "./form.impl";
import type { ErrorForm } from "./form.def";

describe("Form State Machine", () => {
  describe("initialForm", () => {
    it("creates an idle form with empty input", () => {
      const form = initialForm();
      expect(form._tag).toBe("Idle");
      expect(form.input.title).toBe("");
      expect(form.input.description).toBe("");
      expect(form.input.priority).toBe("Medium");
    });
  });

  describe("formGuards", () => {
    it("correctly identifies idle state", () => {
      const form = initialForm();
      expect(formGuards.isIdle(form)).toBe(true);
      expect(formGuards.isEditing(form)).toBe(false);
    });

    it("correctly identifies editing state", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");
      expect(formGuards.isEditing(editing)).toBe(true);
      expect(formGuards.isIdle(editing)).toBe(false);
    });

    it("canSubmit returns true only for editing/error with non-empty title", () => {
      const idle = initialForm();
      expect(formGuards.canSubmit(idle)).toBe(false);

      const editing = formTransitions.edit(idle, "title", "test");
      expect(formGuards.canSubmit(editing)).toBe(true);

      const emptyTitle = formTransitions.edit(idle, "title", "   ");
      expect(formGuards.canSubmit(emptyTitle)).toBe(false);
    });
  });

  describe("formTransitions", () => {
    it("edit transitions from Idle to Editing", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");

      expect(editing._tag).toBe("Editing");
      expect(editing.input.title).toBe("test");
      expect(editing.touched.has("title")).toBe(true);
    });

    it("submit transitions from Editing to Submitting", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");
      const submitting = formTransitions.submit(editing);

      expect(submitting._tag).toBe("Submitting");
      expect(submitting.input.title).toBe("test");
    });

    it("succeed transitions from Submitting to Success", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");
      const submitting = formTransitions.submit(editing);
      const success = formTransitions.succeed(submitting);

      expect(success._tag).toBe("Success");
    });

    it("fail transitions from Submitting to Error", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");
      const submitting = formTransitions.submit(editing);
      const error = formTransitions.fail(submitting, [{ field: "title", message: "Invalid" }]);

      expect(error._tag).toBe("Error");
      expect(error.errors).toHaveLength(1);
    });

    it("reset returns to Idle state", () => {
      const idle = initialForm();
      const editing = formTransitions.edit(idle, "title", "test");
      const reset = formTransitions.reset(editing);

      expect(reset._tag).toBe("Idle");
      expect(reset.input.title).toBe("");
    });
  });

  describe("validateForm", () => {
    it("returns ok for valid input", () => {
      const result = validateForm({ title: "test", description: "", priority: "Medium" });
      expect(result.ok).toBe(true);
    });

    it("returns error for empty title", () => {
      const result = validateForm({ title: "", description: "", priority: "Medium" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.some((e) => e.field === "title")).toBe(true);
      }
    });

    it("returns error for title exceeding max length", () => {
      const longTitle = "a".repeat(101);
      const result = validateForm({ title: longTitle, description: "", priority: "Medium" });
      expect(result.ok).toBe(false);
    });

    it("returns error for description exceeding max length", () => {
      const longDesc = "a".repeat(501);
      const result = validateForm({ title: "test", description: longDesc, priority: "Medium" });
      expect(result.ok).toBe(false);
    });
  });

  describe("error helpers", () => {
    it("getFieldError returns error message for error state", () => {
      const errorForm: ErrorForm = {
        _tag: "Error",
        input: emptyInput(),
        errors: [{ field: "title", message: "Title is required" }],
      };
      expect(getFieldError(errorForm, "title")).toBe("Title is required");
      expect(getFieldError(errorForm, "description")).toBeUndefined();
    });

    it("hasFieldError returns boolean for field error presence", () => {
      const errorForm: ErrorForm = {
        _tag: "Error",
        input: emptyInput(),
        errors: [{ field: "title", message: "Title is required" }],
      };
      expect(hasFieldError(errorForm, "title")).toBe(true);
      expect(hasFieldError(errorForm, "description")).toBe(false);
    });
  });
});
