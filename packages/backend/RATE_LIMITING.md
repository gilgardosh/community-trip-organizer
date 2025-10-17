# Rate Limiting Implementation

## Overview

Rate limiting middleware has been integrated to protect the API from abuse and ensure fair usage.

## Implementation

### Files Modified

1. **`src/middleware/rateLimiter.ts`** - Core rate limiting middleware (now in use)
2. **`src/routes/index.ts`** - General API rate limiting
3. **`src/routes/auth.ts`** - Strict auth endpoint protection
4. **`src/routes/admin.ts`** - Admin operations rate limiting
5. **`src/routes/trip.ts`** - Trip write operations limiting
6. **`src/routes/family.ts`** - Family operations limiting
7. **`src/routes/whatsapp.ts`** - WhatsApp operations limiting

### Rate Limit Configuration

| Endpoint Type | Limit | Window | Use Case |
|--------------|-------|--------|----------|
| **Auth** (login/register) | 5 requests | 15 minutes | Prevent brute force attacks |
| **Admin** | 20 requests | 1 minute | Protect sensitive operations |
| **Write** (create/update) | 10 requests | 1 minute | Prevent abuse of mutations |
| **General API** | 100 requests | 15 minutes | Baseline protection |

### HTTP Headers

Every response includes these headers:

- `X-RateLimit-Limit` - Maximum requests allowed in the window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - ISO timestamp when the limit resets

### Error Response

When rate limited (HTTP 429):

```json
{
  "error": "Too many requests, please try again later"
}
```

For auth endpoints:

```json
{
  "error": "Too many login attempts, please try again later"
}
```

## Testing

### Test Environment Behavior

**Rate limiting is DISABLED by default in test environment** to prevent test failures.

To test rate limiting functionality, set the `TEST_RATE_LIMITING` environment variable:

```typescript
process.env.TEST_RATE_LIMITING = 'true';
```

### Test Suite

A comprehensive test suite is available at `tests/rateLimiter.test.ts` with 18 test cases covering:

- ✅ Rate limit enforcement
- ✅ HTTP headers
- ✅ Per-user tracking
- ✅ Error messages
- ✅ Reset timestamps
- ✅ Different endpoint types

Run rate limiter tests:

```bash
npm test rateLimiter.test.ts
```

## Configuration

Rate limits can be configured via environment variables in `.env`:

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100   # Maximum requests per window
```

These settings affect the **general API** rate limiter. Specific endpoint limiters (auth, admin, write) have hardcoded values in `rateLimiter.ts`.

## Features

### ✅ In-Memory Storage
- Fast performance
- No external dependencies
- Automatic cleanup of expired entries

### ✅ Per-User Tracking
- Authenticated requests: tracked by user ID
- Anonymous requests: tracked by IP address

### ✅ Customizable
- Different limits for different endpoint types
- Custom key generators
- Custom error messages
- Skip successful requests option

## Production Deployment

In production:

1. Rate limiting is **ENABLED** by default
2. Limits are enforced strictly
3. Consider using Redis for distributed rate limiting if scaling horizontally

## Monitoring

Monitor rate limiting effectiveness by tracking:

- Number of 429 responses
- Rate limit header values
- Patterns of rate-limited IPs/users

## Future Enhancements

- [ ] Redis-backed storage for distributed systems
- [ ] Dynamic rate limits based on user tier
- [ ] IP whitelist/blacklist
- [ ] Configurable rate limits via admin panel
- [ ] Rate limit metrics dashboard
