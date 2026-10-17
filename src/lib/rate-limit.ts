// 简单的内存限流（单机场景）。
// 生产多实例部署时，请替换为共享存储（如 Upstash Redis）。

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const store = new Map<string, RateLimitEntry>();

export const LOGIN_WINDOW_MS = 60_000; // 1 分钟窗口
export const LOGIN_MAX_ATTEMPTS = 5; // 窗口内最多尝试次数
export const LOGIN_BLOCK_MS = 5 * 60_000; // 超限后锁定 5 分钟

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.windowStart > LOGIN_WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count + 1 > LOGIN_MAX_ATTEMPTS) {
    const blockedUntil = now + LOGIN_BLOCK_MS;
    store.set(key, { count: 0, windowStart: now, blockedUntil });
    return { allowed: false, retryAfterSeconds: Math.ceil(LOGIN_BLOCK_MS / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** 仅测试用：清空限流状态 */
export function __resetRateLimitForTest() {
  store.clear();
}
