import { describe, it, expect } from "vitest";
import { unsafeCoerce, unwrap, ok, err, succeed, fail, m, fm, fromPromise } from "./index.impl";
import type { newType } from "./index.def";

describe("newType", () => {
  type TestBrand = newType<string, "Test">;

  it("unsafeCoerce creates branded value", () => {
    const v: TestBrand = unsafeCoerce("hello");
    expect(v).toBe("hello");
  });

  it("unwrap extracts underlying value", () => {
    const v: TestBrand = unsafeCoerce("hello");
    expect(unwrap(v)).toBe("hello");
  });
});

describe("Result", () => {
  it("ok creates success result", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("err creates failure result", () => {
    const r = err("error");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("error");
  });
});

describe("Eff", () => {
  it("succeed returns success", async () => {
    const e = succeed(42);
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("fail returns failure", async () => {
    const e = fail("error");
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("error");
  });

  it("m (map) transforms success value", async () => {
    const e = m(succeed(2), (x) => x * 3);
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });

  it("m (map) propagates failure", async () => {
    const e = m(fail("err") as ReturnType<typeof fail<string>>, (x: number) => x * 3);
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("err");
  });

  it("fm (flatMap) chains effects", async () => {
    const e = fm(succeed(2), (x) => succeed(x * 3));
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });

  it("fm (flatMap) short-circuits on failure", async () => {
    const e = fm(fail("err") as ReturnType<typeof fail<string>>, (x: number) => succeed(x * 3));
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("err");
  });

  it("fromPromise handles success", async () => {
    const e = fromPromise(
      () => Promise.resolve(42),
      () => "error",
    );
    const r = await e.run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("fromPromise handles rejection", async () => {
    const e = fromPromise(
      () => Promise.reject(new Error("fail")),
      (e) => (e as Error).message,
    );
    const r = await e.run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("fail");
  });
});
