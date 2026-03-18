import { z } from 'zod';

/**
 * Validates all required environment variables on startup.
 * Call this before connectDB() in server.js.
 * On failure, prints a clear error table and exits the process.
 */
const envSchema = z.object({
    // Server
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database — required
    MONGO_URI: z.string({
        required_error: 'MONGO_URI is required. Add it to your .env file.',
    }).url('MONGO_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)'),

    // Auth — required
    JWT_SECRET: z.string({
        required_error: 'JWT_SECRET is required. Add it to your .env file.',
    }).min(32, 'JWT_SECRET must be at least 32 characters long for security.'),
});

export function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => {
            const field = issue.path.join('.') || 'unknown';
            return `  ❌ ${field}: ${issue.message}`;
        });

        process.stderr.write('\n🚨 Environment validation failed:\n' + errors.join('\n') + '\n\n');
        process.exit(1);
    }

    // Warn about optional but recommended vars
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
        process.stderr.write('⚠️  ImageKit keys not set — file uploads will be disabled.\n');
    }

    return result.data;
}
