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

    const html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h2>🏃 Carrera</h2>

        <p id="estadoCarrera">
            Estado: Esperando
        </p>

        <button onclick="iniciarCarrera()">
            🟢 Iniciar carrera
        </button>

        <br><br>

        <button
            id="btnFinalizar"
            onclick="finalizarCarrera()"
            disabled
        >
            🔴 Finalizar carrera
        </button>
    `;

    setScreen(html);
}

let posicionInicio = null;
let posicionFin = null;
let horaInicio = null;
let horaFin = null;

function iniciarCarrera() {

    if (!navigator.geolocation) {

        alert("Tu dispositivo no soporta GPS.");
        return;
    }

    document.getElementById("estadoCarrera").innerText =
        "Estado: Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(

        function(posicion) {

            posicionInicio = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            };
            horaInicio = new Date(); 

            document.getElementById("estadoCarrera").innerText =
                "🟢 Carrera iniciada";

            document.getElementById("btnFinalizar").disabled = false;

            console.log("Inicio:", posicionInicio);

        },

        function(error) {

            alert("No fue posible obtener la ubicación.");

            console.log(error);

        }

    );

}

async function finalizarCarrera() {

    navigator.geolocation.getCurrentPosition(

        async function (posicion) {

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

                alert("Carrera registrada correctamente.");
                
                backScreen();
                
                await cargarDashboard();

                

            } else {

                alert("No se pudo registrar la carrera.");

            }

        },

        function (error) {

            alert("No fue posible obtener la ubicación final.");
            console.log(error);

        }

    );

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