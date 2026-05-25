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

  // client/main.js (Fragmento para el catálogo)

  const catalogoJuegos = [
    {
      id: "100-mx",
      titulo: "100 Alumnos Dijeron",
      descripcion: "El clásico juego de encuestas adaptado para la comunidad universitaria. Requiere operador.",
      imagen: "ruta/a/tu/imagen-100mx.jpg", // Idealmente un GIF o un WebP animado
      color: "#ef4444" // Rojo
    },
    {
      id: "trivia-murder",
      titulo: "Trivia Mortal",
      descripcion: "Sobrevive respondiendo preguntas. Si fallas, te enfrentas a minijuegos letales.",
      imagen: "ruta/a/tu/imagen-trivia.jpg",
      color: "#8b5cf6" // Morado
    },
    // Puedes agregar más juegos aquí...
  ];

  // Sistema de Persistencia Local (Favoritos)
  function obtenerFavoritos() {
    const favs = localStorage.getItem('fedecu_favoritos');
    return favs ? JSON.parse(favs) : [];
  }

  function alternarFavorito(idJuego) {
    let favs = obtenerFavoritos();
    if (favs.includes(idJuego)) {
      favs = favs.filter(id => id !== idJuego); // Quitar
    } else {
      favs.push(idJuego); // Agregar
    }
    localStorage.setItem('fedecu_favoritos', JSON.stringify(favs));
    renderizarCatalogo(); // Actualizar la vista
  }
});

import { gsap } from 'gsap';

function renderizarCatalogo() {
  const contenedor = document.getElementById('carousel-games');
  contenedor.innerHTML = ''; // Limpiar antes de dibujar

  const favoritos = obtenerFavoritos();

  catalogoJuegos.forEach(juego => {
    const esFav = favoritos.includes(juego.id);

    // Crear la estructura HTML de cada tarjeta
    const tarjeta = document.createElement('div');
    tarjeta.className = 'game-card gs-reveal'; // Clase para GSAP
    tarjeta.style.backgroundImage = `url(${juego.imagen}), linear-gradient(${juego.color}, #000)`;

    tarjeta.innerHTML = `
            <div class="card-details">
                <h3 style="margin:0; font-size:1.2rem;">${juego.titulo}</h3>
                <p style="font-size:0.8rem; margin: 5px 0;">${juego.descripcion}</p>
                <div class="card-actions">
                    <button class="btn-play" onclick="abrirJuego('${juego.id}')">▶ Jugar</button>
                    <button class="btn-icon" onclick="abrirOpciones('${juego.id}')">⚙️</button>
                    <button class="btn-icon" onclick="alternarFavorito('${juego.id}')">${esFav ? '❤️' : '🤍'}</button>
                </div>
            </div>
        `;
    contenedor.appendChild(tarjeta);
  });

  // --- ANIMACIÓN APPLE CON GSAP ---
  // Animamos el Header bajando suavemente
  gsap.fromTo('.hub-header',
    { y: -100, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
  );

  // Animamos las tarjetas apareciendo una por una (stagger)
  gsap.fromTo('.gs-reveal',
    { y: 50, opacity: 0, scale: 0.9 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }
  );
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', renderizarCatalogo);
