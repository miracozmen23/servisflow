import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaClient, UserRole } from '../src/generated/prisma/client';

const BCRYPT_COST = 12;
const PASSWORD_PLACEHOLDER = 'replace_with_a_strong_demo_password';

config({
  path: resolve(__dirname, '../../../.env'),
  quiet: true,
});

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main(): Promise<void> {
  const databaseUrl = getRequiredEnvironmentVariable('DATABASE_URL');
  const email = getRequiredEnvironmentVariable(
    'SEED_TECHNICIAN_EMAIL',
  ).toLowerCase();
  const password = getRequiredEnvironmentVariable('SEED_TECHNICIAN_PASSWORD');
  const firstName = getRequiredEnvironmentVariable(
    'SEED_TECHNICIAN_FIRST_NAME',
  );
  const lastName = getRequiredEnvironmentVariable('SEED_TECHNICIAN_LAST_NAME');

  if (password === PASSWORD_PLACEHOLDER || password.length < 12) {
    throw new Error(
      'SEED_TECHNICIAN_PASSWORD must be changed and contain at least 12 characters.',
    );
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    max: 1,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hash(password, BCRYPT_COST);
    const technician = await prisma.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        passwordHash,
        role: UserRole.TECHNICIAN,
      },
      create: {
        email,
        firstName,
        lastName,
        passwordHash,
        role: UserRole.TECHNICIAN,
      },
      select: {
        email: true,
        role: true,
      },
    });

    console.info(
      `Technician seed completed for ${technician.email} (${technician.role}).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Technician seed failed.', error);
  process.exitCode = 1;
});
