import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const databaseUrl =
    'postgresql://servisflow:password@localhost:5432/servisflow';

  it('normalizes valid values', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: `  ${databaseUrl}  `,
        NODE_ENV: 'production',
        PORT: '10000',
      }),
    ).toMatchObject({
      DATABASE_URL: databaseUrl,
      NODE_ENV: 'production',
      PORT: 10000,
    });
  });

  it('uses safe development defaults', () => {
    expect(validateEnvironment({ DATABASE_URL: databaseUrl })).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3001,
    });
  });

  it('rejects a missing database URL', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL is required.');
  });

  it('rejects an unsupported environment', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: databaseUrl, NODE_ENV: 'staging' }),
    ).toThrow('NODE_ENV must be one of: development, test, production.');
  });

  it.each(['0', '65536', 'not-a-port'])('rejects invalid port %s', (port) => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: databaseUrl, PORT: port }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('rejects a non-PostgreSQL connection URL', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: 'https://example.com/database' }),
    ).toThrow('DATABASE_URL must use the postgres or postgresql protocol.');
  });
});
