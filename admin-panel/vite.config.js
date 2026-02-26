import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://localhost:8002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                configure: (proxy) => {
                    // Ensure cookies are forwarded properly
                    proxy.on('proxyRes', (proxyRes) => {
                        const setCookie = proxyRes.headers['set-cookie'];
                        if (setCookie) {
                            // Remove any domain restrictions so cookie works on proxy origin
                            proxyRes.headers['set-cookie'] = setCookie.map(c =>
                                c.replace(/;\s*Domain=[^;]*/gi, '')
                                    .replace(/;\s*Secure/gi, '')
                            );
                        }
                    });
                },
            },
        },
    },
});
