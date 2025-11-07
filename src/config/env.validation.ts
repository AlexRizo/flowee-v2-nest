import { treeifyError, z } from 'zod';

export const validateEnv = (env: Record<string, unknown>): Env => {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    throw new Error(JSON.stringify(treeifyError(result.error)));
  }

  return result.data;
};

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),

  POSTGRES_USER: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_NAME: z.string(),
  POSTGRES_PASS: z.string(),
  DATABASE_URL: z.url(),

  CORS_ORIGIN: z.url(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES: z.string(),

  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET: z.string(),
  AWS_CF_CDN: z.url(),
});

export type Env = z.infer<typeof envSchema>;
