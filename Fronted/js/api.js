// ===============================
// LOGIN
// ===============================
async function apiLogin(email, password) {

    const datos = new URLSearchParams();

    datos.append("username", email);
    datos.append("password", password);

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: datos
        }
    );

    const resultado = await respuesta.json();

    return {
        ok: respuesta.ok,
        status: respuesta.status,
        data: resultado
    };

}

async function apiRegistrarUsuario(datos) {

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/usuarios",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    return {
        ok: respuesta.ok,
        status: respuesta.status,
        data: resultado
    };

}
async function apiDashboard(token){

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/me",
        {
            method: "GET",
            headers:{
                "Authorization":"Bearer " + token
            }
        }
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data: data
    };

}

async function apiCrearEquipo(token, datos) {

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/equipos",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        }
    );

    return {
        ok: respuesta.ok,
        data: await respuesta.json()
    };
}

async function apiVerMiEquipo(equipoId) {

    const respuesta = await fetch(
        `https://runfun-0epk.onrender.com/equipos/${equipoId}/detalle`
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data
    };

}

async function apiSalirDelEquipo(token) {

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/mi-equipo/salir",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data
    };

}


async function apiEliminarEquipo(token, equipoId) {

    const respuesta = await fetch(
        `https://runfun-0epk.onrender.com/equipos/${equipoId}`,
        {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data: data
    };

}

async function apiAbrirRanking(equipoId) {

    const respuesta = await fetch(
        `https://runfun-0epk.onrender.com/equipos/${equipoId}/ranking`
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data
    };

}

async function apiCrearCarrera(token, carrera) {

    const respuesta = await fetch(
        "https://runfun-0epk.onrender.com/carreras",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(carrera)
        }
    );

    const data = await respuesta.json();

    return {
        ok: respuesta.ok,
        data
    };

}