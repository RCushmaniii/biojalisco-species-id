import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// eslint-config-next 16 ships native flat config, so the FlatCompat bridge
// (and @eslint/eslintrc) is no longer needed.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16 bundles eslint-plugin-react-hooks 7, which adds
    // React Compiler advisory rules as errors. This app does not enable the
    // React Compiler, and the flagged code (localStorage/matchMedia reads in
    // mount effects) is deliberate hydration-safe behaviour. Kept visible as
    // warnings rather than rewritten during a dependency upgrade.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
