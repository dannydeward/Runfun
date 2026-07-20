async function abrirEquipo(){

   const html =(`
        <h3>👥 Equipo</h3>

        <button onclick="mostrarCrearEquipo()">➕ Crear equipo</button>
        <button onclick="verEquipos()">🔗 Unirse a equipo</button>
        <button onclick="backScreen()">⬅</button>
        <button onclick="salir()">🚪</button>
    `);
    setScreen(html);
}

function mostrarCrearEquipo() {

    let html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h2>👥 Crear equipo</h2>

        <input
            id="nombreEquipo"
            type="text"
            placeholder="Nombre del equipo"
        >

        <textarea
            id="descEquipo"
            placeholder="Descripción del equipo"
        ></textarea>

        <br><br>

        <button onclick="crearEquipo()">
            ✅ Crear equipo
        </button>
    `;

    setScreen(html);

}


async function crearEquipo() {

    const nombre = document.getElementById("nombreEquipo").value;
    const descripcion = document.getElementById("descEquipo").value;
    const token = localStorage.getItem("token");

    const respuesta = await apiCrearEquipo(
        token,
        {
            nombre,
            descripcion
        }
    );

    const data = respuesta.data;

    if (respuesta.ok) {

        alert("Equipo creado ✔");         

        backScreen();

    } else {

        alert(data.detail || "Error al crear equipo");

    }

}


async function cargarEquipos() {

    const token = localStorage.getItem("token");

    const respuesta = await fetch("https://runfun-0epk.onrender.com/equipos", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const equipos = await respuesta.json();

    let html = "<h3>Equipos</h3>";

  equipos.forEach(e => {
    html += `
        <div style="padding:10px;border-bottom:1px solid #ddd">
            <b>${e.nombre}</b><br>
            <small>${e.descripcion || ""}</small><br><br>

            <button onclick="unirseEquipo(${e.id})">
                Unirme
            </button>

           
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
            <button onclick="abrirRanking(${e.id})">
                🏆 Ranking</button>
            
            <button onclick="eliminarEquipo(${e.id})">
    🗑 Eliminar
</button>
<button onclick="backScreen()">⬅</button>

        </div>
    `;
});   

       setScreen(html);;

}   

async function verEquipos() {

    await cargarEquipos();

}


    async function unirseEquipo(equipoId) {

    const token = localStorage.getItem("token");

    const respuesta = await fetch(
        `https://runfun-0epk.onrender.com/equipos/${equipoId}/unirse`,
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await respuesta.json();

    if (respuesta.ok) {

        alert("Te uniste al equipo ✔");

        backScreen();              // vuelve al Dashboard
        await cargarDashboard();   // actualiza el Dashboard

    } else {

        alert(data.error || data.detail || "Error al unirse");

    }

}

async function verMiEquipo(equipoId) {

    const respuesta = await apiVerMiEquipo(equipoId);

    const data = respuesta.data;

    if (!respuesta.ok) {

        alert(data.detail || "No se pudo cargar el equipo");

        return;
    }

    let html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h2>👥 ${data.equipo}</h2>

        <p>${data.descripcion}</p>

        <p><b>Km totales:</b> ${data.km_totales}</p>

        <p><b>Integrantes:</b> ${data.cantidad_integrantes}</p>

        <br>

        <button onclick="abrirRanking(${equipoId})">
            🏆 Ver ranking
        </button>

        <br><br>

        <button onclick="salirDelEquipo()">
            🚪 Salir del equipo
        </button>

        <hr>

        <h3>Integrantes</h3>
    `;

    data.ranking.forEach(u => {

        html += `
            <div class="card">
                <b>${u.nombre}</b> ${u.apellido || ""}<br>
                ${u.km} km
            </div>
        `;

    });

    setScreen(html);

}

async function salirDelEquipo() {

    if (!confirm("¿Deseas salir del equipo?")) {
        return;
    }

    const token = localStorage.getItem("token");

    const respuesta = await apiSalirDelEquipo(token);

    const data = respuesta.data;

    if (respuesta.ok) {

        alert(data.mensaje);

        backScreen();

        await cargarDashboard();

    } else {

        alert(data.error || data.detail || "No se pudo salir del equipo");

    }

}


async function eliminarEquipo(equipoId) {

    if (!confirm("¿Deseas eliminar este equipo?")) {
        return;
    }

    const token = localStorage.getItem("token");

    const respuesta = await apiEliminarEquipo(token, equipoId);

    const data = respuesta.data;

    if (respuesta.ok) {

        alert(data.mensaje);

        await cargarEquipos();

    } else {

        alert(
            data.error ||
            data.detail ||
            data.mensaje ||
            "No se pudo eliminar el equipo"
        );

    }
}

async function abrirRanking(equipoId) {

    const respuesta = await apiAbrirRanking(equipoId);

    const data = respuesta.data;

    if (!respuesta.ok) {

        alert(data.detail || data.error || "No se pudo cargar el ranking");

        return;

    }

    let html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h3>🏆 Ranking</h3>
    `;

    data.forEach(u => {

        html += `
            <div class="card">
                <b>${u.nombre}</b> ${u.apellido || ""}<br>
                <p>${u.km} km</p>
            </div>
        `;

    });

    setScreen(html);

}