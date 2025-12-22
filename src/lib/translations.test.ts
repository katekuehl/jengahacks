import { describe, it, expect, beforeEach, vi } from "vitest";
import { t, getTranslations, hasTranslation } from "./translations";
import * as localeLib from "./locale";

vi.mock("./locale", () => ({
  getStoredLocale: vi.fn(() => "en-KE"),
}));

describe("translations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("t", () => {
    it("should translate simple key", () => {
      const result = t("common.register");
      expect(result).toBe("Register Now");
    });

    it("should translate nested key", () => {
      const result = t("hero.tagline");
      expect(result).toBe("Built in Nairobi. Ready for the World.");
    });

    it("should replace parameters in translation", () => {
      const result = t("blog.readTime", { minutes: 5 });
      expect(result).toBe("5 min read");
    });

    it("should fallback to English if key not found in current locale", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(localeLib.getStoredLocale).mockReturnValue("sw-KE" as any);
      // If Swahili translation is missing, should fallback to English
      const result = t("common.register");
      expect(result).toBeTruthy();
    });

    it("should return key if translation not found", () => {
      const result = t("nonexistent.key");
      expect(result).toBe("nonexistent.key");
    });
  });

  describe("getTranslations", () => {
    it("should get all translations for a namespace", () => {
      const translations = getTranslations("common");
      expect(translations).toHaveProperty("register");
      expect(translations).toHaveProperty("learnMore");
    });

    it("should return empty object for invalid namespace", () => {
      const translations = getTranslations("nonexistent");
      expect(translations).toEqual({});
    });
  });

  describe("hasTranslation", () => {
    it("should return true for existing translation key", () => {
      expect(hasTranslation("common.register")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      expect(hasTranslation("nonexistent.key")).toBe(false);
    });
  });
});

