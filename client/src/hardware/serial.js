export async function conectarArduino(socket, roomCode) {
    if (!('serial' in navigator)) {
        alert("Tu navegador no soporta conexión con Arduino. Usa Google Chrome o Edge.");
        return;
    }

    try {
        const puerto = await navigator.serial.requestPort();
        await puerto.open({ baudRate: 38400 }); // Cambia esto si tu Arduino usa 9600

        const decodificador = new TextDecoderStream();
        const flujo = puerto.readable.pipeTo(decodificador.writable);
        const lector = decodificador.readable.getReader();

        alert("Arduino conectado con éxito. Presiona un botón físico.");

        while (true) {
            const { value, done } = await lector.read();
            if (done) break;
            if (value) {
                // Enviar la señal del Arduino directamente al servidor
                socket.emit('game_action', {
                    roomCode: roomCode,
                    action: 'arduino_button_pressed',
                    payload: value.trim()
                });
            }
        }
    } catch (error) {
        console.error("Error conectando al hardware:", error);
    }
}
