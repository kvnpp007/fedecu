import './src/css/style.css';
import { io } from 'socket.io-client';
import { conectarArduino } from './src/hardware/serial.js';
// import { gsap } from 'gsap'; // Listo para cuando animes SVGs
// import { Howl } from 'howler'; // Listo para tus sonidos

// Conexión al servidor (Cuando subas el backend a Railway, cambia esta URL)
const URL_SERVIDOR = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.2k7.dev';
const socket = io(URL_SERVIDOR);

// Variables de estado
let miCodigoDeSala = '';
let miRol = '';

// Referencias del DOM
const domLobby = document.getElementById('lobby');
const domMasterBoard = document.getElementById('master-board');
const domPlayerControls = document.getElementById('player-controls');

// ---------------------------------------------------------
// FUNCIONES DEL HOST (PANTALLA)
// ---------------------------------------------------------
document.getElementById('btn-host').addEventListener('click', () => {
  socket.emit('create_room');
});

socket.on('room_created', (code) => {
  miCodigoDeSala = code;
  miRol = 'host';

  // Cambiar UI
  domLobby.style.display = 'none';
  domMasterBoard.style.display = 'flex';
  document.getElementById('room-code-display').innerText = code;

  iniciarMotorDeEscalado();
});

socket.on('player_connected', (data) => {
  const txt = document.getElementById('players-list-display');
  if (txt.innerText === 'Esperando jugadores...') txt.innerText = '';
  txt.innerText += ` ${data.username} ha entrado! \n`;
  // Aquí puedes usar Howler.js para reproducir un sonido de "Ding"
});

socket.on('master_action_trigger', (data) => {
  // Esto reacciona cuando un teléfono o Arduino aprieta el botón
  console.log("ACCIÓN RECIBIDA EN PANTALLA:", data);

  // Aquí puedes usar GSAP para hacer estallar partículas en la pantalla
  const bgOriginal = domMasterBoard.style.background;
  domMasterBoard.style.background = 'radial-gradient(circle, #ef4444 0%, #7f1d1d 100%)';
  setTimeout(() => domMasterBoard.style.background = bgOriginal, 200);
});

// --- MOTOR DE ESCALADO VIRTUAL (Para 800x600 o 8K) ---
function iniciarMotorDeEscalado() {
  const tablero = document.getElementById('master-board');
  const anchoNativo = 1920;
  const altoNativo = 1080;

  function ajustar() {
    const escala = Math.min(window.innerWidth / anchoNativo, window.innerHeight / altoNativo);
    tablero.style.transform = `translate(-50%, -50%) scale(${escala})`;
  }
  window.addEventListener('resize', ajustar);
  ajustar(); // Ejecutar la primera vez
}


// ---------------------------------------------------------
// FUNCIONES DEL JUGADOR (TELÉFONO / ARDUINO)
// ---------------------------------------------------------
document.getElementById('btn-join').addEventListener('click', () => {
  const code = document.getElementById('input-code').value;
  const name = document.getElementById('input-name').value;
  if (code && name) {
    socket.emit('join_room', { roomCode: code, username: name });
  }
});

socket.on('joined_successfully', (data) => {
  miCodigoDeSala = data.code;
  miRol = 'player';
  domLobby.style.display = 'none';
  domPlayerControls.style.display = 'flex';
});

// Botón digital en pantalla del teléfono
document.getElementById('btn-buzzer').addEventListener('click', () => {
  socket.emit('game_action', {
    roomCode: miCodigoDeSala,
    action: 'buzzer_pressed',
    payload: { time: Date.now() }
  });
});

// Vincular hardware físico por puerto Serial
document.getElementById('btn-connect-arduino').addEventListener('click', () => {
  conectarArduino(socket, miCodigoDeSala);
});
