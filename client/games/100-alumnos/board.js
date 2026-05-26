import { io } from 'socket.io-client';

const URL_SERVIDOR = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.2k7.dev';
const socket = io(URL_SERVIDOR);

// 1. MOTOR DE ESCALADO VIRTUAL
function inicializarMotorEscalado() {
    const tablero = document.getElementById('master-board');
    const anchoNativo = 1920;
    const altoNativo = 1080;

    function ajustar() {
        const escala = Math.min(window.innerWidth / anchoNativo, window.innerHeight / altoNativo);
        tablero.style.transform = `translate(-50%, -50%) scale(${escala})`;
    }
    window.addEventListener('resize', ajustar);
    ajustar();
}

// 2. GENERADOR DE FOCOS DEL BORDE (Como un show de TV real)
function generarFocos() {
    const marco = document.getElementById('marco-focos');
    const cantidadTopBottom = 25; // Focos horizontales
    const cantidadLaterales = 15; // Focos verticales

    // Focos Superiores e Inferiores
    for (let i = 0; i <= cantidadTopBottom; i++) {
        let posX = (i / cantidadTopBottom) * 100;
        marco.innerHTML += `<div class="foco" style="top: 0%; left: ${posX}%;"></div>`;
        marco.innerHTML += `<div class="foco" style="bottom: 0%; left: ${posX}%;"></div>`;
    }
    // Focos Laterales
    for (let i = 1; i < cantidadLaterales; i++) {
        let posY = (i / cantidadLaterales) * 100;
        marco.innerHTML += `<div class="foco" style="left: 0%; top: ${posY}%;"></div>`;
        marco.innerHTML += `<div class="foco" style="right: 0%; top: ${posY}%;"></div>`;
    }
}

// 3. GENERADOR DEL PANEL (Con tus clases originales)
function construirPanel(cantidad) {
    const grid = document.getElementById('grid-respuestas');
    grid.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        grid.innerHTML += `
            <div class="casilla" id="casilla-${i}">
                <div class="casilla-inner">
                    <div class="casilla-frente"><span class="posicion font-led">${i}</span></div>
                    <div class="casilla-atras">
                        <span class="texto-respuesta">RESPUESTA ${i}</span>
                        <span class="puntos-respuesta font-led">00</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 4. FUNCIONES DE SHOW: VOLTEO Y STRIKES
window.simularVolteo = function (num, texto, puntos) {
    const casilla = document.getElementById(`casilla-${num}`);
    if (casilla) {
        casilla.querySelector('.texto-respuesta').innerText = texto;
        casilla.querySelector('.puntos-respuesta').innerText = puntos;
        casilla.classList.add('revelada'); // Tu CSS hace la magia 3D
    }
};

window.tirarStrike = function (cantidadEquis) {
    const tablero = document.getElementById('master-board');
    const marcoFocos = document.getElementById('marco-focos');
    const contStrikes = document.getElementById('contenedor-strikes-visual');

    // Generar las X gigantes
    contStrikes.innerHTML = '';
    for (let i = 0; i < cantidadEquis; i++) {
        contStrikes.innerHTML += `<div class="strike-marca-gigante" style="font-family: Impact, sans-serif; font-size: 350px; color: #ef4444; text-shadow: 0 0 80px #ef4444, 10px 10px 30px black; animation: zoom-in-strike 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">X</div>`;
    }

    // Efecto Shake y Luces Rojas
    tablero.classList.add('pantalla-shake');
    marcoFocos.classList.add('evento-strike');

    // Quitar los efectos después de 1 segundo
    setTimeout(() => {
        tablero.classList.remove('pantalla-shake');
        marcoFocos.classList.remove('evento-strike');
        contStrikes.innerHTML = '';
    }, 1200);
};

// ARRANQUE
document.addEventListener('DOMContentLoaded', () => {
    inicializarMotorEscalado();
    generarFocos();
    construirPanel(8);
});
