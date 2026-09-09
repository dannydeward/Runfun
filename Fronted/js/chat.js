

function abrirChat() {

    const html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
        </div>

        <h2>💬 Chat RunFun</h2>

        <div id="listaMensajes">
            Cargando mensajes...
        </div>

        <br>

        <input
            type="text"
            id="mensajeInput"
            placeholder="Escribe un mensaje..."
        >

        <button onclick="enviarMensajeChat()">
            Enviar
        </button>
    `;

    setScreen(html);

    cargarMensajesChat();
    setInterval(cargarMensajesChat, 2000);
}

async function cargarMensajesChat() {
    console.log("ACTUALIZANDO CHAT");

    const respuesta = await apiObtenerMensajes();

    const lista = document.getElementById("listaMensajes");

    if (!respuesta.ok) {
        lista.innerText = "No se pudieron cargar los mensajes.";
        return;
    }

    lista.innerHTML = "";

    respuesta.data.forEach(mensaje => {

        const elemento = document.createElement("p");

    elemento.innerText =
    mensaje.nombre + " " + mensaje.apellido + ": " +
    mensaje.contenido;

        lista.appendChild(elemento);
    });
}

async function enviarMensajeChat() {

    const input = document.getElementById("mensajeInput");
    const contenido = input.value.trim();

    if (!contenido) {
        return;
    }

    const token = localStorage.getItem("token");

    const respuesta = await apiEnviarMensaje(
        token,
        contenido
    );

    if (respuesta.ok) {

    input.value = "";

    cargarMensajesChat();

}
}