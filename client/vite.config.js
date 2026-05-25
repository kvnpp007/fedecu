import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // La vista principal
                main: 'index.html',

                // Las vistas de 100 Alumnos (Rutas directas sin puntos ni __dirname)
                tableroCien: 'games/100-alumnos/index.html',
                operadorCien: 'games/100-alumnos/operador.html',
                jugadorCien: 'games/100-alumnos/player.html'
            }
        }
    }
});
