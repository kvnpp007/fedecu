import { defineConfig } from 'vite';
import { resolve } from 'path';

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
                // La vista principal (El Lobby)
                main: resolve(__dirname, 'index.html'),

                // Las rutas del juego (Añadimos el ./ para que Vite sepa buscar desde la raíz de /client)
                cienAlumnosBoard: resolve(__dirname, './games/100-alumnos/index.html'),
                cienAlumnosOperator: resolve(__dirname, './games/100-alumnos/operator.html'),
                cienAlumnosPlayer: resolve(__dirname, './games/100-alumnos/player.html')
            }
        }
    }
});
