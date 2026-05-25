import { gsap } from 'gsap';

// 1. Catálogo de Juegos
const catalogoJuegos = [
  {
    id: "100-alumnos",
    titulo: "100 Alumnos Dijeron",
    descripcion: "El clásico de encuestas adaptado a la universidad. Dinámica de equipos y panel de operador.",
    imagen: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
    color: "#3b82f6"
  }
];

// 2. Sistema de Favoritos Local
function obtenerFavoritos() {
  const favs = localStorage.getItem('fedecu_favoritos');
  return favs ? JSON.parse(favs) : [];
}

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

// 3. Sistema de Navegación a las carpetas del juego
window.abrirJuego = function (idJuego) {
  if (idJuego === '100-alumnos') {
    window.location.href = '/games/100-alumnos/index.html';
  }
};

window.abrirOpciones = function (idJuego) {
  if (idJuego === '100-alumnos') {
    window.location.href = '/games/100-alumnos/operador.html';
  }
};

// 4. Inyección del Catálogo en el HTML
function renderizarCatalogo() {
  const contenedor = document.getElementById('carousel-games');

  // Si no estamos en la página del lobby, no hacer nada
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const favoritos = obtenerFavoritos();

  catalogoJuegos.forEach(juego => {
    const esFav = favoritos.includes(juego.id);
    const tarjeta = document.createElement('div');
    tarjeta.className = 'game-card gs-reveal';

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

  // Disparamos la animación "Apple"
  gsap.fromTo('.gs-reveal',
    { y: 50, opacity: 0, scale: 0.9 },
    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }
  );
}

// 5. Ejecutar cuando la página termine de cargar
document.addEventListener('DOMContentLoaded', renderizarCatalogo);
