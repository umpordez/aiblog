import globals from 'globals';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    {
        ignores: [
            'build/**/*',
            'blog-ui/public/dist/**/*',
            'blog-ui/public/lib/**/*'
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser
            }
        }
    }
);
