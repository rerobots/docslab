import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        supportFile: false,
        specPattern: 'tests/end-to-end/**/*.cy.{ts,tsx}',
    },
});
