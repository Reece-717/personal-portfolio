import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  __resetRateLimitForTest,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_BLOCK_MS,
} from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimitForTest();
  });

  it("窗口内前 N 次允许", () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
      expect(checkRateLimit("key").allowed).toBe(true);
    }
  });

  it("超过次数后拒绝", () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) checkRateLimit("key");
    expect(checkRateLimit("key").allowed).toBe(false);
  });

  it("不同 key 互不影响", () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) checkRateLimit("a");
    expect(checkRateLimit("b").allowed).toBe(true);
  });

  it("锁定到期后恢复", () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) checkRateLimit("key");
      expect(checkRateLimit("key").allowed).toBe(false);

      vi.advanceTimersByTime(LOGIN_BLOCK_MS + 1000);
      expect(checkRateLimit("key").allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
