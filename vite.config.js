import { defineConfig } from 'vite';
import { resolve } from 'path';
import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({
    plugins: [injectHTML()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});