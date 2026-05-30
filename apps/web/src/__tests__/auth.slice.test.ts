import { authReducer, setCredentials, logout } from '../store/slices/auth.slice';
import type { AuthUser } from '../store/slices/auth.slice';

const MOCK_USER: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
};

describe('auth slice', () => {
  it('starts with null token and user', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setCredentials stores token and user', () => {
    const state = authReducer(
      undefined,
      setCredentials({ token: 'jwt-token', user: MOCK_USER })
    );
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(MOCK_USER);
    expect(state.user?.email).toBe('test@example.com');
  });

  it('logout clears token and user', () => {
    let state = authReducer(undefined, setCredentials({ token: 'jwt-token', user: MOCK_USER }));
    state = authReducer(state, logout());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('preserves other state fields during setCredentials', () => {
    const state = authReducer(
      undefined,
      setCredentials({ token: 'abc', user: { ...MOCK_USER, role: 'admin' } })
    );
    expect(state.user?.role).toBe('admin');
  });
});
