import {
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../generated/prisma/client';
import type { AuthContext } from '../auth.types';
import { RolesGuard } from './roles.guard';

const customerAuth: AuthContext = {
  sessionId: '00000000-0000-0000-0000-000000000001',
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'customer@example.test',
    firstName: 'Test',
    lastName: 'Customer',
    role: UserRole.CUSTOMER,
  },
};

function createContext(auth?: AuthContext): ExecutionContext {
  return {
    getClass: () => class TestController {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({
      getRequest: () => (auth === undefined ? {} : { auth }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('allows routes without role metadata', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows a user with a required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.CUSTOMER]);

    expect(guard.canActivate(createContext(customerAuth))).toBe(true);
  });

  it('rejects a user without a required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.TECHNICIAN]);

    expect(() => guard.canActivate(createContext(customerAuth))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects role-protected access without an authenticated user', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.CUSTOMER]);

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });
});
