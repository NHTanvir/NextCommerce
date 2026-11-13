import { defineConfig } from 'vitest/config';

// The suites here are written against the globals (describe/it/expect) the
// other packages' configs already enable.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
