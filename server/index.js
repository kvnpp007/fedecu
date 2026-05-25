import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'online', timestamp: Date.now() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Memoria de las salas activas
const ROOMS = new Map();

io.on('connection', (socket) => {
    console.log(`[+] Conexión nueva: ${socket.id}`);

    // La pantalla del proyector crea la sala
    socket.on('create_room', () => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        ROOMS.set(roomCode, { displayId: socket.id, players: new Map() });
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Sala creada: ${roomCode}`);
    });

    // Un teléfono o Arduino se une a la sala
    socket.on('join_room', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        if (ROOMS.has(code)) {
            const room = ROOMS.get(code);
            room.players.set(socket.id, { username, score: 0 });
            socket.join(code);

            socket.emit('joined_successfully', { code, role: 'player' });
            // Avisar a la pantalla que alguien entró
            io.to(room.displayId).emit('player_connected', { id: socket.id, username });
        } else {
            socket.emit('join_error', 'Código de sala inválido');
        }
    });

    // Recibir acción (botón de teléfono o Arduino) y mandarlo a la pantalla
    socket.on('game_action', ({ roomCode, action, payload }) => {
        const code = roomCode.toUpperCase();
        if (ROOMS.has(code)) {
            const room = ROOMS.get(code);
            io.to(room.displayId).emit('master_action_trigger', {
                senderId: socket.id,
                action,
                payload
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[-] Desconexión: ${socket.id}`);
        // Lógica futura: limpiar salas vacías
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Servidor de juegos activo en el puerto ${PORT}`);
});
