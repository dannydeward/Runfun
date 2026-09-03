async function crearCarrera() {

    const distancia = document.getElementById("distancia").value;
    const tiempo = document.getElementById("tiempo").value;

    const token = localStorage.getItem("token");

    const respuesta = await apiCrearCarrera(
        token,
        {
            distancia: parseFloat(distancia),
            tiempo_minutos: parseInt(tiempo)
        }
    );

    const data = respuesta.data;

    if (respuesta.ok) {

        alert("Carrera registrada correctamente");

        backScreen();

    } else {

        alert(
            data.error ||
            data.detail ||
            "Error al crear carrera"
        );

    }

}

function abrirCarrera() {

    const carreraActiva = localStorage.getItem("carrera_activa");

    const html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h2>🏃 Carrera</h2>
        <div id="relojCarrera"
     style="font-size: 32px; font-weight: bold;">
    00:00:00
</div>

        <p id="estadoCarrera">
            ${carreraActiva
                ? "🟢 Carrera activa recuperada"
                : "Estado: Esperando"}
        </p>

        ${carreraActiva ? "" : `
    <button onclick="iniciarCarrera()">
        🟢 Iniciar carrera
    </button>
`}
        <br><br>

        <button
            id="btnFinalizar"
            onclick="finalizarCarrera()"
            ${carreraActiva ? "" : "disabled"}
        >
            🔴 Finalizar carrera
        </button>
    `;

    setScreen(html);

    if (carreraActiva) {

        const datos = JSON.parse(carreraActiva);

        horaInicio = new Date(datos.horaInicio);
        posicionInicio = datos.posicionInicio;
        posicionFin = datos.ultimaPosicion;

        console.log("CARRERA RECUPERADA:", datos);
        recuperarCarreraGPS();
    }
}

function iniciarCarrera() {

    if (!navigator.geolocation) {
        alert("Tu dispositivo no soporta GPS.");
        return;
    }

    document.getElementById("estadoCarrera").innerText =
        "Estado: Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(

        function(posicion) {

            const punto = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            };

            const inicio = new Date().getTime();

            posicionInicio = punto;
            horaInicio = new Date(inicio);
            iniciarReloj();

            // Guardar carrera activa
            localStorage.setItem(
                "carrera_activa",
                JSON.stringify({
                    activa: true,
                    horaInicio: inicio,
                    posicionInicio: punto,
                    ultimaPosicion: punto,
                    distancia: 0
                })
            );

            document.getElementById("estadoCarrera").innerText =
                "🟢 Carrera iniciada";

            document.getElementById("btnFinalizar").disabled = false;

            console.log("Carrera activa guardada:", {
                horaInicio: inicio,
                posicionInicio: punto
            });

        },

        function(error) {

            console.log("ERROR GPS:", error);

            alert(
                "Error GPS\n" +
                "Código: " + error.code + "\n" +
                "Mensaje: " + error.message
            );
        }
    );
}
function iniciarReloj() {

    if (window.intervaloReloj) {
        clearInterval(window.intervaloReloj);
    }

    function actualizarReloj() {

        if (!horaInicio) return;

        const ahora = new Date();
        const segundos = Math.floor(
            (ahora - horaInicio) / 1000
        );

        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const seg = segundos % 60;

        const reloj =
            String(horas).padStart(2, "0") + ":" +
            String(minutos).padStart(2, "0") + ":" +
            String(seg).padStart(2, "0");

        const elemento = document.getElementById("relojCarrera");

        if (elemento) {
            elemento.innerText = reloj;
        }
    }

    actualizarReloj();

    window.intervaloReloj =
        setInterval(actualizarReloj, 1000);
}
function calcularDistancia(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;

}

async function finalizarCarrera() {

    navigator.geolocation.getCurrentPosition(

        async function(posicion) {

            posicionFin = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            };

            horaFin = new Date();

            const tiempoMinutos =
                Math.round((horaFin - horaInicio) / 60000);

            const km = calcularDistancia(
                posicionInicio.lat,
                posicionInicio.lng,
                posicionFin.lat,
                posicionFin.lng
            );

            console.log("Tiempo:", tiempoMinutos, "minutos");
            console.log("Kilómetros:", km.toFixed(2));

            const token = localStorage.getItem("token");

            const respuesta = await apiCrearCarrera(
                token,
                {
                    distancia: km,
                    tiempo_minutos: tiempoMinutos
                }
            );

            if (respuesta.ok) {

                  if (window.intervaloReloj) {
        clearInterval(window.intervaloReloj);
        window.intervaloReloj = null;
    }

                localStorage.removeItem("carrera_activa");

                alert("Carrera registrada correctamente.");

                backScreen();

                await cargarDashboard();

            } else {

                alert("No se pudo registrar la carrera.");
            }
        },

        function(error) {

            alert("No fue posible obtener la ubicación final.");
            console.log(error);

        }
    );
}

function recuperarCarreraGPS() {

    const carreraActiva = localStorage.getItem("carrera_activa");

    if (!carreraActiva) return;

    const datos = JSON.parse(carreraActiva);

    navigator.geolocation.getCurrentPosition(

        function(posicion) {

            const nuevaPosicion = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            };

            const kmTramo = calcularDistancia(
                datos.ultimaPosicion.lat,
                datos.ultimaPosicion.lng,
                nuevaPosicion.lat,
                nuevaPosicion.lng
            );

            const distanciaTotal =
                Number(datos.distancia || 0) + kmTramo;

            datos.ultimaPosicion = nuevaPosicion;
            datos.distancia = distanciaTotal;

            localStorage.setItem(
                "carrera_activa",
                JSON.stringify(datos)
            );

            console.log("GPS RECUPERADO");
            console.log("KM DEL TRAMO:", kmTramo);
            console.log("KM TOTAL:", distanciaTotal);

        },

        function(error) {

            console.log(
                "No se pudo recuperar GPS:",
                error
            );

        }
    );
}