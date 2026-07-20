function abrirRetoIndividual() {

    let opcionesNumero = "";

    for (let i = 1; i <= 100; i++) {
        opcionesNumero += `<option value="${i}">${i}</option>`;
    }

    const html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h2>🎯 Crear reto</h2>

        <label>Kilómetros objetivo</label><br>
        <input
            type="number"
            id="km_objetivo"
            placeholder="Ej: 50"
        >

        <br><br>

        <label>Plazo</label><br>

        <select id="plazo_valor">
            ${opcionesNumero}
        </select>

        <select id="plazo_unidad">
            <option value="horas">Horas</option>
            <option value="dias">Días</option>
            <option value="semanas">Semanas</option>
            <option value="meses">Meses</option>
            <option value="años">Años</option>
        </select>

        <br><br>

        <button onclick="guardarReto()">
            💾 Guardar reto
        </button>
    `;

    setScreen(html);
}

function abrirRetoEquipo() {

    let opcionesNumero = "";

    for (let i = 1; i <= 100; i++) {
        opcionesNumero += `<option value="${i}">${i}</option>`;
    }


    const html = `

        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>


        <h2>🏆 Crear reto de equipo</h2>


        <label>Kilómetros objetivo del equipo</label><br>

        <input
            type="number"
            id="km_objetivo_equipo"
            placeholder="Ej: 100"
        >


        <br><br>


        <label>Plazo</label><br>


        <select id="plazo_valor_equipo">
            ${opcionesNumero}
        </select>


        <select id="plazo_unidad_equipo">

            <option value="horas">Horas</option>
            <option value="dias">Días</option>
            <option value="semanas">Semanas</option>
            <option value="meses">Meses</option>
            <option value="años">Años</option>

        </select>


        <br><br>


        <button onclick="guardarRetoEquipo()">
            💾 Guardar reto equipo
        </button>

    `;


    setScreen(html);

}



async function guardarReto() {

    const km_objetivo = parseFloat(
        document.getElementById("km_objetivo").value
    );

    const plazo_valor = parseInt(
        document.getElementById("plazo_valor").value
    );

    const plazo_unidad =
        document.getElementById("plazo_unidad").value;

    const token = localStorage.getItem("token");

    const respuesta = await fetch(
        "http://127.0.0.1:8000/retos",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                km_objetivo,
                plazo_valor,
                plazo_unidad
            })
        }
    );

    const data = await respuesta.json();
    console.log(respuesta.status);
    console.log(data);

    if (respuesta.ok) {

        alert(data.mensaje);

        backScreen();

    } else {

        alert(data.error || "No se pudo crear el reto");

    }

}

async function guardarRetoEquipo() {


    const km_objetivo = parseFloat(
        document.getElementById("km_objetivo_equipo").value
    );


    const plazo_valor = parseInt(
        document.getElementById("plazo_valor_equipo").value
    );


    const plazo_unidad =
        document.getElementById("plazo_unidad_equipo").value;


    const token = localStorage.getItem("token");


    const equipo_id = window.equipoId;


    const respuesta = await fetch(
        `http://127.0.0.1:8000/retos-equipo?equipo_id=${equipo_id}`,
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },

            body:JSON.stringify({

                km_objetivo,
                plazo_valor,
                plazo_unidad

            })

        }
    );


    const data = await respuesta.json();


    console.log(data);


    if(respuesta.ok){

        alert(data.mensaje);

        backScreen();

    }else{

        alert(
            data.error || "No se pudo crear reto de equipo"
        );

    }


}

async function obtenerRetoActivo() {

    const token = localStorage.getItem("token");

    const respuesta = await fetch(
        "http://127.0.0.1:8000/retos/activo",
        {
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    return await respuesta.json();

}

