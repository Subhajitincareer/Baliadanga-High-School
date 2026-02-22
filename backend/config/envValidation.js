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
        required_error: 'JWT_SECRET is required. Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
    }).min(32, 'JWT_SECRET must be at least 32 characters long'),

    // CORS
    CLIENT_URL: z.string().url().default('http://localhost:8080'),

    // ImageKit — optional (warn if missing)
    IMAGEKIT_PUBLIC_KEY: z.string().optional(),
    IMAGEKIT_PRIVATE_KEY: z.string().optional(),
    IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),

    // Seed Admin — optional (only needed in development)
    SEED_ADMIN_EMAIL: z.string().email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

export function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('\n❌  Environment validation failed. Server cannot start.\n');
        console.error('Missing or invalid environment variables:');
        result.error.issues.forEach((issue) => {
            const field = issue.path.join('.') || 'unknown';
            console.error(`  ✗  ${field}: ${issue.message}`);
        });
        console.error('\nPlease check your backend/.env file.\n');
        process.exit(1);
    }

    // Warn about optional but recommended vars
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
        console.warn('⚠️  ImageKit env vars not set — file uploads will not work.');
    }

    return result.data;
}
