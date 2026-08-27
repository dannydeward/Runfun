async function cargarDashboard() {

    const token = localStorage.getItem("token");

    try {

        const respuesta = await apiDashboard(token);

        const data = respuesta.data;

        console.log("USUARIO:", data.id);
        console.log("CARGANDO GRÁFICO 7 DÍAS...");
        cargarGrafico7Dias();

        const reto = await obtenerRetoActivo();

        console.log("RETO:", reto);

        const retoCard = document.getElementById("reto-card");

         if (retoCard) {

            retoCard.innerHTML = `

                <h4 style="color:yellow;">
                    ${reto.km_actual} / ${reto.km_objetivo} km
                </h4>

                <p style="color:yellow;">
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

document.getElementById("km-actual").innerText =
    Number(kmActual).toFixed(2);

document.getElementById("km-objetivo").innerText =
    Number(kmObjetivo).toFixed(2);

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

async function cargarGrafico7Dias() {

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
        console.log("No hay usuario autenticado");
        return;
    }

    try {

        const respuesta = await fetch(
            `https://runfun-0epk.onrender.com/usuarios/${userId}/carreras`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            console.log("Error obteniendo carreras");
            return;
        }

        const carreras = await respuesta.json();

        console.log("CARRERAS:", carreras);

        // Últimos 7 días
        const hoy = new Date();
        const dias = [];

        for (let i = 6; i >= 0; i--) {

            const fecha = new Date(hoy);
            fecha.setHours(0, 0, 0, 0);
            fecha.setDate(hoy.getDate() - i);

            dias.push({
                fecha: fecha,
                km: 0
            });
        }

        // Sumar kilómetros por día
        carreras.forEach(carrera => {

            const fechaCarrera = new Date(carrera.fecha);
            fechaCarrera.setHours(0, 0, 0, 0);

            dias.forEach(dia => {

                if (
                    fechaCarrera.getTime() ===
                    dia.fecha.getTime()
                ) {
                    dia.km += Number(carrera.distancia || 0);
                }

            });

        });

        console.log("ÚLTIMOS 7 DÍAS:", dias);

    const barras = document.querySelectorAll(".barra");
const items = document.querySelectorAll(".barra-item");

console.log("BARRAS ENCONTRADAS:", barras.length);

// Mayor distancia de los últimos 7 días
const maxKm = Math.max(...dias.map(dia => dia.km), 0);

const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

barras.forEach((barra, index) => {

    const km = dias[index].km;

    // Altura mínima para que los días sin actividad sean visibles
    let altura = 8;

    if (maxKm > 0 && km > 0) {
        altura = Math.max((km / maxKm) * 120, 8);
    }

    barra.style.height = altura + "px";

    // Mostrar kilómetros al pasar el mouse
    barra.title = km.toFixed(3) + " km";

    // Día
    const diaElemento = items[index].querySelector(".dia-barra");

    const numeroDia = dias[index].fecha.getDay();

    diaElemento.innerText = nombresDias[numeroDia];

    console.log(
        "BARRA", index,
        "KM:", km,
        "ALTURA:", altura
    );
});

    } catch (error) {

        console.log(
            "Error gráfico últimos 7 días:",
            error
        );

    }
}