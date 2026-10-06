const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', 'src/core/db/migrations/*', 'supabase/functions/*'],
  },
  {
    // core/domain은 순수 TypeScript만 쓴다 (01 문서 3장 폴더 규칙).
    files: ['src/core/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-*',
                'expo',
                'expo-*',
                'drizzle-orm',
                'drizzle-orm/*',
                '@/features/*',
                '@/shared/*',
                '@/core/db/*',
                '@/core/api/*',
              ],
              message: 'core/domain은 React Native, DB, 네트워크에 의존하지 않는다.',
            },
          ],
        },
      ],
    },
  },
]);
