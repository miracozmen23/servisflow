const SUPPORTED_NODE_ENVIRONMENTS = [
  'development',
  'test',
  'production',
] as const;

type NodeEnvironment = (typeof SUPPORTED_NODE_ENVIRONMENTS)[number];

function readNodeEnvironment(value: unknown): NodeEnvironment {
  const nodeEnvironment = value ?? 'development';

  if (
    typeof nodeEnvironment !== 'string' ||
    !SUPPORTED_NODE_ENVIRONMENTS.includes(nodeEnvironment as NodeEnvironment)
  ) {
    throw new Error(
      `NODE_ENV must be one of: ${SUPPORTED_NODE_ENVIRONMENTS.join(', ')}.`,
    );
  }

  return nodeEnvironment as NodeEnvironment;
}

function readPort(value: unknown): number {
  const port = Number(value ?? 3001);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function readDatabaseUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('DATABASE_URL is required.');
  }

  const databaseUrl = value.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error(
      'DATABASE_URL must use the postgres or postgresql protocol.',
    );
  }

  return databaseUrl;
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...environment,
    NODE_ENV: readNodeEnvironment(environment.NODE_ENV),
    PORT: readPort(environment.PORT),
    DATABASE_URL: readDatabaseUrl(environment.DATABASE_URL),
  };
}
