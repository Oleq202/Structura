import os
import time
import logging
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException, Request

logger = logging.getLogger("structura.rate_limiter")

# ---------------------------------------------------------------------------
# Trusted proxy configuration (SEC-06)
# Only use X-Forwarded-For when the direct client IP is in this set.
# Set TRUSTED_PROXIES=10.0.0.1,10.0.0.2 in your environment for production.
# Leave empty (default) to always use the real socket IP.
# ---------------------------------------------------------------------------
TRUSTED_PROXIES: frozenset[str] = frozenset(
    ip.strip()
    for ip in os.getenv("TRUSTED_PROXIES", "").split(",")
    if ip.strip()
)

# ---------------------------------------------------------------------------
# Optional Redis client (SEC-05)
# Initialised lazily on first use. If REDIS_URL is not set or Redis is
# unreachable the limiter transparently falls back to per-process memory.
# ---------------------------------------------------------------------------
_redis_client = None
_redis_unavailable = False  # stop retrying after the first connection failure


async def _get_redis():
    global _redis_client, _redis_unavailable
    if _redis_client is not None:
        return _redis_client
    if _redis_unavailable:
        return None

    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        return None

    try:
        import redis.asyncio as aioredis  # type: ignore
        client = aioredis.from_url(redis_url, decode_responses=True)
        await client.ping()
        _redis_client = client
        logger.info("Rate limiter: Redis backend connected (%s).", redis_url.split("@")[-1])
        return _redis_client
    except Exception as exc:
        _redis_unavailable = True
        logger.warning(
            "Rate limiter: Redis unavailable (%s). "
            "Falling back to in-process memory — rate limiting will NOT be "
            "shared across multiple worker processes.",
            exc,
        )
        return None


# ---------------------------------------------------------------------------
# Limiter class
# ---------------------------------------------------------------------------

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # In-memory fallback storage
        self._records: Dict[str, List[float]] = defaultdict(list)

    # ------------------------------------------------------------------
    # IP extraction (SEC-06: trusted-proxy aware)
    # ------------------------------------------------------------------
    def _get_client_ip(self, request: Request) -> str:
        real_ip = request.client.host if request.client else "unknown"
        if real_ip in TRUSTED_PROXIES:
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                return forwarded.split(",")[0].strip()
        return real_ip

    # ------------------------------------------------------------------
    # In-memory sliding window (also kept for unit tests via is_rate_limited)
    # ------------------------------------------------------------------
    def is_rate_limited(self, key: str) -> Tuple[bool, int]:
        """Synchronous in-memory check — used by unit tests and as fallback."""
        now = time.time()
        window_start = now - self.window_seconds
        timestamps = [t for t in self._records[key] if t > window_start]
        self._records[key] = timestamps

        if len(timestamps) >= self.max_requests:
            retry_after = int(timestamps[0] + self.window_seconds - now) + 1
            return True, max(1, retry_after)

        self._records[key].append(now)
        return False, 0

    # ------------------------------------------------------------------
    # Redis sliding window (SEC-05: distributed across processes)
    # ------------------------------------------------------------------
    async def _is_rate_limited_redis(self, redis, key: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - self.window_seconds

        # Remove timestamps outside the current window
        await redis.zremrangebyscore(key, 0, window_start)
        # Count requests still in the window
        count = await redis.zcard(key)

        if count >= self.max_requests:
            oldest = await redis.zrange(key, 0, 0, withscores=True)
            if oldest:
                oldest_ts = oldest[0][1]
                retry_after = int(oldest_ts + self.window_seconds - now) + 1
            else:
                retry_after = self.window_seconds
            return True, max(1, retry_after)

        # Register this request (use str(now) as a unique member)
        await redis.zadd(key, {str(now): now})
        await redis.expire(key, self.window_seconds + 1)
        return False, 0

    # ------------------------------------------------------------------
    # Public check — called from endpoint handlers (must be awaited)
    # ------------------------------------------------------------------
    async def check(self, request: Request, key_prefix: str = "auth") -> None:
        ip = self._get_client_ip(request)
        key = f"{key_prefix}:{ip}"

        redis = await _get_redis()
        if redis:
            try:
                limited, retry_after = await self._is_rate_limited_redis(redis, key)
            except Exception as exc:
                logger.warning("Redis rate-limit check failed (%s); using in-memory.", exc)
                limited, retry_after = self.is_rate_limited(key)
        else:
            limited, retry_after = self.is_rate_limited(key)

        if limited:
            raise HTTPException(
                status_code=429,
                detail=f"Too many requests. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )


# ---------------------------------------------------------------------------
# Shared instances used by main.py
# ---------------------------------------------------------------------------
login_rate_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
refresh_rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)
