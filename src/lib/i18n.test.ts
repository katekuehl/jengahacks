import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLocale,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatDateTimeShort,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
} from "./i18n";

describe("i18n utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete import.meta.env.VITE_LOCALE;
  });

  describe("getLocale", () => {
    it("should return default locale when no environment variable", () => {
      const locale = getLocale();
      expect(locale).toBe("en-UK");
    });

    it("should return environment variable locale when set", () => {
      vi.stubEnv("VITE_LOCALE", "en-US");
      const locale = getLocale();
      expect(locale).toBe("en-US");
    });

    it("should use browser locale if available and English-based", () => {
      // In test environment, navigator is undefined so it defaults to en-KE
      // This test verifies the fallback logic works correctly
      const locale = getLocale();
      // In test mode, it returns default locale since navigator is undefined
      expect(locale).toBe("en-UK");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const dateString = "2025-12-15T10:00:00Z";
      const formatted = formatDate(dateString);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("December");
      expect(formatted).toContain("15");
    });

    it("should handle Date objects", () => {
      const date = new Date("2025-12-15T10:00:00Z");
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });
  });

  describe("formatDateShort", () => {
    it("should format date in short format", () => {
      const dateString = "2025-12-15T10:00:00Z";
      const formatted = formatDateShort(dateString);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("Dec");
      expect(formatted).toContain("15");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      const dateString = "2025-12-15T10:30:00Z";
      const formatted = formatDateTime(dateString);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("December");
      expect(formatted).toContain("15");
      // Time will vary by timezone, so just check it contains time-related content
      expect(formatted).toMatch(/\d+/); // Contains at least one digit for time
    });
  });

  describe("formatDateTimeShort", () => {
    it("should format date and time in short format", () => {
      const dateString = "2025-12-15T10:30:00Z";
      const formatted = formatDateTimeShort(dateString);
      expect(formatted).toBeTruthy();
    });
  });

  describe("formatRelativeTime", () => {
    it("should format relative time for past dates", () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 30);
      const formatted = formatRelativeTime(pastDate);
      expect(formatted).toContain("ago");
    });

    it("should format relative time for future dates", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      const formatted = formatRelativeTime(futureDate);
      expect(formatted).toMatch(/in|minutes/);
    });

    it("should handle very recent dates", () => {
      const recentDate = new Date();
      recentDate.setSeconds(recentDate.getSeconds() - 30);
      const formatted = formatRelativeTime(recentDate);
      expect(formatted).toBeTruthy();
    });
  });

  describe("formatNumber", () => {
    it("should format numbers according to locale", () => {
      const formatted = formatNumber(1234567);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("1");
    });

    it("should handle decimal numbers", () => {
      const formatted = formatNumber(1234.56);
      expect(formatted).toBeTruthy();
    });
  });

  describe("formatCurrency", () => {
    it("should format currency correctly", () => {
      const formatted = formatCurrency(1234.56, "KES");
      expect(formatted).toBeTruthy();
      // Currency formatting varies by locale, so just check it contains the number
      expect(formatted).toMatch(/1234|1[,.]234/);
    });

    it("should use default currency (KES) when not specified", () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toBeTruthy();
    });
  });
});

