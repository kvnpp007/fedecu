import { defineConfig } from 'vite';

export default defineConfig({
    // Configuración del servidor de desarrollo local
    server: {
        port: 5173, // El puerto por defecto
        open: true  // Esto abrirá tu navegador automáticamente al iniciar
    },
    // Directorio de salida cuando compiles para producción
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
});
