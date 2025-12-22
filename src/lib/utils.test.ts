import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const condition1 = false;
    const condition2 = true;
    expect(cn("foo", condition1 && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", condition2 && "bar", "baz")).toBe("foo bar baz");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle empty strings and null/undefined", () => {
    expect(cn("foo", "", null, undefined, "bar")).toBe("foo bar");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });
});

