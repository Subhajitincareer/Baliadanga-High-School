import rateLimit from 'express-rate-limit';

/**
 * Strict limiter for login endpoints — 5 attempts per IP per 15 minutes.
 * After 5 failed attempts, return 429 with a clear message.
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased for dev/testing
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    },
    skipSuccessfulRequests: true, // Only count failed (non-2xx) requests
});

/**
 * General API limiter — 100 requests per IP per 15 minutes.
 * Protects all routes from scraping/abuse.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
});
