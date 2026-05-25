import './src/css/style.css';
import { io } from 'socket.io-client';
import { conectarArduino } from './src/hardware/serial.js';
import { gsap } from 'gsap'; // Listo para cuando animes SVGs
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
      id: "100-alumnos",
      titulo: "100 Alumnos Dijeron",
      descripcion: "El clásico de encuestas adaptado a la universidad. Dinámica de equipos, robos de puntos y panel de operador.",
      // Usamos un gradiente elegante por ahora si no hay imagen
      imagen: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
      color: "#3b82f6" // Azul institucional
    }
    // Puedes agregar más juegos aquí...
  ];

  // Sistema de Persistencia Local (Favoritos)
  function obtenerFavoritos() {
    const favs = localStorage.getItem('fedecu_favoritos');
    return favs ? JSON.parse(favs) : [];
  }

  // Hacemos que estas funciones sean globales para que el HTML (onclick) pueda verlas
  window.alternarFavorito = function (idJuego) {
    let favs = obtenerFavoritos();
    if (favs.includes(idJuego)) {
      favs = favs.filter(id => id !== idJuego);
    } else {
      favs.push(idJuego);
    }
    localStorage.setItem('fedecu_favoritos', JSON.stringify(favs));
    renderizarCatalogo();
  };

  window.abrirJuego = function (idJuego) {
    if (idJuego === '100-alumnos') {
      // Ocultar el lobby y mostrar la vista de creación de sala de 100 Alumnos
      document.getElementById('lobby').style.display = 'none';

      // Aquí pediremos al servidor que cree la sala con la lógica de este juego específico
      socket.emit('create_room', { gameType: '100-alumnos' });
    }
  };

  window.abrirOpciones = function (idJuego) {
    alert("Abriendo panel de operador y bases de datos para: " + idJuego);
  };


  function renderizarCatalogo() {
    const contenedor = document.getElementById('carousel-games');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const favoritos = obtenerFavoritos();

    catalogoJuegos.forEach(juego => {
      const esFav = favoritos.includes(juego.id);
      const tarjeta = document.createElement('div');
      tarjeta.className = 'game-card gs-reveal';

      // Si la "imagen" empieza con http o ./ usamos url(), si no, asumimos que es un gradiente CSS
      const fondo = juego.imagen.includes('gradient') ? juego.imagen : `url(${juego.imagen})`;
      tarjeta.style.background = fondo;

      tarjeta.innerHTML = `
            <div class="card-details">
                <h3 style="margin:0; font-size:1.4rem; font-weight: 800; color: white;">${juego.titulo}</h3>
                <p style="font-size:0.9rem; margin: 8px 0; color: #cbd5e1;">${juego.descripcion}</p>
                <div class="card-actions">
                    <button class="btn-play" onclick="abrirJuego('${juego.id}')">▶ Jugar</button>
                    <button class="btn-icon" onclick="abrirOpciones('${juego.id}')">⚙️</button>
                    <button class="btn-icon" onclick="alternarFavorito('${juego.id}')">${esFav ? '❤️' : '🤍'}</button>
                </div>
            </div>
        `;
      contenedor.appendChild(tarjeta);
    });

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.gs-reveal',
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }
  }

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
});

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', renderizarCatalogo);
