async function cargarDashboard() {

    const token = localStorage.getItem("token");

    try {

        const respuesta = await apiDashboard(token);

        const data = respuesta.data;

        const reto = await obtenerRetoActivo();

        console.log("RETO:", reto);

        const retoCard = document.getElementById("reto-card");

        if (retoCard) {

            retoCard.innerHTML = `

                <h4 style="color:black;">
                    ${reto.km_actual} / ${reto.km_objetivo} km
                </h4>

                <p style="color:black;">
                    Plazo: ${reto.plazo_valor} ${reto.plazo_unidad}
                </p>

                <button onclick="abrirRetoIndividual()">
                    Modificar reto
                </button>

            `;
        }

        console.log("STATUS:", respuesta.ok);
        console.log("DATA:", data);

        if (!respuesta.ok) {

            document.getElementById("nombre").innerText =
                "No autorizado";

            return;
        }

        document.getElementById("nombre").innerText =
            data.nombre || "";

        // ========= PROGRESO DEL RETO =========

        const kmActual = data.reto.km_actual || 0;
        const kmObjetivo = data.reto.km_objetivo || 5;

        document.getElementById("km-actual").innerText = kmActual;
        document.getElementById("km-objetivo").innerText = kmObjetivo;

        const porcentaje = Math.min(
            (kmActual / kmObjetivo) * 100,
            100
        );

        document.getElementById("porcentaje-reto").innerText =
            porcentaje.toFixed(0) + "%";

        document.getElementById("progress-bar").style.width =
            porcentaje + "%";

        // ================================

        document.getElementById("carreras").innerText =
            data.carreras || 0;

        const equipoElemento =
            document.getElementById("equipo");

        if (equipoElemento) {

            equipoElemento.innerText =
                data.equipo || "Sin equipo";

        }

        const miEquipoCard =
            document.getElementById("mi-equipo-card");

        if (data.equipo && data.equipo !== "Sin equipo") {

            window.equipoId = data.equipo_id;

            if (miEquipoCard) {

                miEquipoCard.style.display = "block";

                document.getElementById("equipo-nombre").innerText =
                    data.equipo;

                document.getElementById("equipo-km").innerText =
                    data.equipo_km || 0;

                const botonExiste =
                    document.getElementById("boton-reto-equipo");

                if (!botonExiste) {

                    miEquipoCard.innerHTML += `

                        <div id="boton-reto-equipo">

                            <br>

                            <button onclick="abrirRetoEquipo()">

                                🏆 Crear reto de equipo

                            </button>

                        </div>

                    `;

                }

            }

        } else {

            if (miEquipoCard) {

                miEquipoCard.style.display = "none";

            }

        }

    } catch(error) {

        console.log("Error dashboard:", error);

        document.getElementById("nombre").innerText =
            "Error de conexión con el servidor";

    }

}