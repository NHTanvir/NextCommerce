import { loginSchema, registerSchema } from '../lib/schemas/auth';

describe('loginSchema', () => {
  it('accepts a well-formed email + 8-char password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'abcdefgh' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'abcdefgh' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 chars', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    name: 'Alice Smith',
    email: 'a@b.co',
    password: 'abcdefgh',
    confirmPassword: 'abcdefgh',
  };

  it('accepts a valid payload', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('rejects when confirmPassword does not match password', () => {
    const r = registerSchema.safeParse({ ...base, confirmPassword: 'different' });
    expect(r.success).toBe(false);
  });

  it('rejects a short name', () => {
    const r = registerSchema.safeParse({ ...base, name: 'A' });
    expect(r.success).toBe(false);
  });
});
