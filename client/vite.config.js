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
                // La vista principal (El Lobby)
                main: './index.html',

                // Las rutas del juego (¡Nombres exactos!)
                boardCien: './games/100-alumnos/index.html',
                operadorCien: './games/100-alumnos/operador.html',
                playerCien: './games/100-alumnos/player.html'
            }
        }
    }
});
