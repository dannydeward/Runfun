async function abrirPerfil() {

    const token = localStorage.getItem("token");

    const respuesta = await fetch(
        "http://127.0.0.1:8000/me",
        {
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await respuesta.json();

    let html = (`        

        <h2>👤 Mi Perfil</h2>

        <img
    id="preview_foto"
    <img
    id="preview_foto"
    src="http://127.0.0.1:8000/uploads/perfiles/${data.foto || 'default.jpg'}"
    width="120", style="border-radius:50%; display:block; margin:auto;"
>
  

<br><br>

        <input id="perfil_nombre" value="${data.nombre || ""}" placeholder="Nombre">

        <input id="perfil_apellido" value="${data.apellido || ""}" placeholder="Apellido">

        <input id="perfil_email" value="${data.email || ""}" readonly>

        <input id="perfil_edad" type="number" value="${data.edad || ""}" placeholder="Edad">

        <input id="perfil_pais" value="${data.pais || ""}" placeholder="País">

        <input id="perfil_ciudad" value="${data.ciudad || ""}" placeholder="Ciudad">

        <textarea
    id="perfil_descripcion"
    placeholder="Cuéntanos algo de ti..."
>${data.descripcion || ""}</textarea>

<br><br>

<input
    type="file"
    id="perfil_foto"
    accept="image/*"
>

<br><br>

<button onclick="guardarPerfil()">
    💾 Guardar cambios
</button>

<div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>
    `);
    setScreen(html);
}

async function guardarPerfil() {

    const token = localStorage.getItem("token");

    const datos = {

        nombre: document.getElementById("perfil_nombre").value,
        apellido: document.getElementById("perfil_apellido").value,
        edad: parseInt(document.getElementById("perfil_edad").value),
        pais: document.getElementById("perfil_pais").value,
        ciudad: document.getElementById("perfil_ciudad").value,
        descripcion: document.getElementById("perfil_descripcion").value

    };

    const respuesta = await fetch(
        "http://127.0.0.1:8000/me",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    const archivo = document.getElementById("perfil_foto").files[0];

if (archivo) {

    const formData = new FormData();

    formData.append("foto", archivo);

    await fetch(
        "http://127.0.0.1:8000/me/foto",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        }
    );

}

    alert(resultado.mensaje);

    await abrirPerfil();

    }