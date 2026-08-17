// 1. Procesar carreras para armar los puntos del eje X (Días) y eje Y (KM Acumulados)
function obtenerPuntosGrafica(carreras) {
    let acumulado = 0;
    const datosGrafica = [{ fecha: '0', km: 0 }];

    if (Array.isArray(carreras) && carreras.length > 0) {
        // Ordenar carreras por fecha (ascendente)
        carreras.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        carreras.forEach((carrera, index) => {
            const kmCarrera = parseFloat(carrera.distancia || carrera.distancia_km || 0);
            acumulado += kmCarrera;

            const fechaObj = new Date(carrera.fecha || Date.now());
            const etiquetaX = `Día ${index + 1}`; // O la fecha: fechaObj.getDate()

            datosGrafica.push({
                fecha: etiquetaX,
                km: Number(acumulado.toFixed(2))
            });
        });
    }

    return datosGrafica;
}

// 2. Generar Gráfica SVG con estilo de ejes e incrementos (estilo escalonado / lineal)
function generarGraficaSVG(puntos, objetivo = 100) {
    const width = 340;
    const height = 180;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;

    const maxKm = Math.max(objetivo, ...puntos.map(p => p.km));
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calcular coordenadas
    const coords = puntos.map((p, index) => {
        const x = paddingLeft + (index / (puntos.length > 1 ? puntos.length - 1 : 1)) * chartWidth;
        const y = height - paddingBottom - (p.km / maxKm) * chartHeight;
        return { x, y, km: p.km, fecha: p.fecha };
    });

    // Crear línea de camino (Path) estilo escalón o suave
    let pathD = "";
    coords.forEach((p, idx) => {
        if (idx === 0) {
            pathD += `M ${p.x} ${p.y}`;
        } else {
            // Dibujar escalón o recta hacia el nuevo punto acumulado
            const prev = coords[idx - 1];
            pathD += ` L ${p.x} ${p.y}`;
        }
    });

    // Puntos (Círculos)
    const circulos = coords.map(p => 
        `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#00ffcc" stroke="#1e1e2f" stroke-width="2">
            <title>${p.fecha}: ${p.km} KM</title>
         </circle>`
    ).join('');

    // Marcas Eje Y (0, 20, 40, 60, 80, 100)
    const marcasY = [0, 20, 40, 60, 80, 100].map(val => {
        const yPos = height - paddingBottom - (val / maxKm) * chartHeight;
        return `
            <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.1)"/>
            <text x="${paddingLeft - 8}" y="${yPos + 4}" fill="#aaa" font-size="9" text-anchor="end">${val}</text>
        `;
    }).join('');

    // Marcas Eje X (Días)
    const marcasX = coords.map(p => 
        `<text x="${p.x}" y="${height - 10}" fill="#aaa" font-size="9" text-anchor="middle">${p.fecha}</text>`
    ).join('');

    return `
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; margin: 15px 0;">
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                <!-- Ejes Y y líneas de fondo -->
                ${marcasY}

                <!-- Eje X -->
                <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="rgba(255,255,255,0.4)"/>
                ${marcasX}

                <!-- Etiqueta KM -->
                <text x="10" y="15" fill="#aaa" font-size="9">KM</text>

                <!-- Línea de Avance -->
                <path d="${pathD}" fill="none" stroke="#00ffcc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

                <!-- Círculos en los puntos de carrera -->
                ${circulos}
            </svg>
        </div>
    `;
}

// 3. Abrir Vista del Perfil
async function abrirPerfil() {
    const token = localStorage.getItem("token");

    try {
        const resUser = await fetch("https://runfun-0epk.onrender.com/me", {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await resUser.json();

        let carreras = [];
        if (data.id) {
            const resCarreras = await fetch(`https://runfun-0epk.onrender.com/usuarios/${data.id}/carreras`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (resCarreras.ok) {
                carreras = await resCarreras.json();
            }
        }

        const kmTotal = Number(data.km || 0).toFixed(2);
        const totalCarreras = data.carreras || carreras.length || 0;
        const retoActual = Number(data.reto?.km_actual || 0).toFixed(2);
        const retoObjetivo = Number(data.reto?.km_objetivo || 100).toFixed(2);

        const puntosGrafica = obtenerPuntosGrafica(carreras);
        const graficaSVG = generarGraficaSVG(puntosGrafica, Number(retoObjetivo));

        let html = `
            <div class="top-bar">
                <button onclick="backScreen()">⬅</button>
                <button onclick="salir()">🚪</button>
            </div>

            <div class="perfil-container">

                <!-- HEADER (Centrado) -->
                <div class="perfil-header" style="text-align: center; margin-bottom: 20px;">
                    <img
                        src="https://runfun-0epk.onrender.com/uploads/perfiles/${data.foto || 'default.jpg'}"
                        class="perfil-foto"
                        style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid #00ffcc;"
                    >
                    <h2 style="margin: 10px 0 5px 0;">${data.nombre || ""} ${data.apellido || ""}</h2>
                    <p style="margin: 0; color: #ccc;">
                        📍 ${data.ciudad || ""}${data.ciudad && data.pais ? ", " : ""}${data.pais || ""}
                    </p>
                </div>

                <hr style="border: 0.5px solid rgba(255,255,255,0.15); margin: 15px 0;">

                <!-- INFORMACIÓN PERSONAL (Alineada a la izquierda) -->
                <div class="perfil-datos" style="text-align: left; padding: 0 10px;">
                    <h3 style="margin-bottom: 12px; font-size: 15px; text-transform: uppercase; color: #00ffcc;">Información personal</h3>
                    <p><strong>Nombre:</strong> ${data.nombre || "No indicado"} ${data.apellido || ""}</p>
                    <p><strong>Edad:</strong> ${data.edad || "No indicada"}</p>
                    <p><strong>País:</strong> ${data.pais || "No indicado"}</p>
                    <p><strong>Ciudad:</strong> ${data.ciudad || "No indicada"}</p>
                    <p><strong>Email:</strong> ${data.email || ""}</p>
                    <p><strong>Sobre mí:</strong> ${data.descripcion || "Todavía no agregaste una descripción."}</p>
                </div>

                <hr style="border: 0.5px solid rgba(255,255,255,0.15); margin: 15px 0;">

                <!-- PROGRESO DEL RETO (Gráfica Estilo Escalón) -->
                <div style="text-align: center;">
                    <h3 style="margin-bottom: 5px; font-size: 15px; text-transform: uppercase; color: #00ffcc;">Progreso del Reto</h3>
                    <h4 style="margin: 0; font-size: 18px;">${retoActual} / ${retoObjetivo} KM</h4>
                    
                    ${graficaSVG}
                </div>

                <hr style="border: 0.5px solid rgba(255,255,255,0.15); margin: 15px 0;">

                <!-- MÉTRICAS -->
                <div class="perfil-metricas" style="display: flex; justify-content: space-around; text-align: center; margin: 15px 0;">
                    <div class="metrica">
                        <strong style="display: block; font-size: 18px;">${kmTotal}</strong>
                        <span style="font-size: 11px; color: #ccc;">KM TOTALES</span>
                    </div>

                    <div class="metrica">
                        <strong style="display: block; font-size: 18px;">${totalCarreras}</strong>
                        <span style="font-size: 11px; color: #ccc;">CARRERAS</span>
                    </div>

                    ${data.equipo ? `
                        <div class="metrica">
                            <strong style="display: block; font-size: 18px;">${data.equipo}</strong>
                            <span style="font-size: 11px; color: #ccc;">EQUIPO</span>
                        </div>
                    ` : ""}
                </div>

                <!-- ACCIONES -->
                <div style="text-align: center; margin-top: 20px;">
                    <button
                        class="btn-editar-perfil"
                        onclick="abrirPerfilEdicion()">
                        ✏️ Editar perfil
                    </button>
                </div>

            </div>
        `;

        setScreen(html);

    } catch (error) {
        console.error("Error al abrir perfil:", error);
    }
}

// 4. Formulario de Edición con Selector de Foto
async function abrirPerfilEdicion() {
    const token = localStorage.getItem("token");

    const res = await fetch("https://runfun-0epk.onrender.com/me", {
        headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();

    const html = `
        <div class="top-bar">
            <button onclick="abrirPerfil()">⬅</button>
        </div>

        <div class="perfil-container" style="text-align: left; padding: 15px;">
            <h2 style="text-align: center;">Editar Perfil</h2>

            <div style="margin-bottom: 15px;">
                <label><strong>📷 Foto de perfil:</strong></label><br>
                <input type="file" id="perfil_foto" accept="image/*" style="margin-top: 5px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label>Nombre:</label>
                <input type="text" id="perfil_nombre" value="${data.nombre || ''}" style="width: 100%; padding: 8px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label>Apellido:</label>
                <input type="text" id="perfil_apellido" value="${data.apellido || ''}" style="width: 100%; padding: 8px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label>Edad:</label>
                <input type="number" id="perfil_edad" value="${data.edad || ''}" style="width: 100%; padding: 8px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label>País:</label>
                <input type="text" id="perfil_pais" value="${data.pais || ''}" style="width: 100%; padding: 8px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label>Ciudad:</label>
                <input type="text" id="perfil_ciudad" value="${data.ciudad || ''}" style="width: 100%; padding: 8px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label>Sobre mí:</label>
                <textarea id="perfil_descripcion" style="width: 100%; height: 60px; padding: 8px;">${data.descripcion || ''}</textarea>
            </div>

            <div style="text-align: center;">
                <button onclick="guardarPerfil()" style="padding: 10px 20px; cursor: pointer;">
                    💾 Guardar Cambios
                </button>
            </div>
        </div>
    `;

    setScreen(html);
}

// 5. Guardar Datos y Subir la Foto al Servidor
async function guardarPerfil() {
    const token = localStorage.getItem("token");

    const datos = {
        nombre: document.getElementById("perfil_nombre").value,
        apellido: document.getElementById("perfil_apellido").value,
        edad: parseInt(document.getElementById("perfil_edad").value) || 0,
        pais: document.getElementById("perfil_pais").value,
        ciudad: document.getElementById("perfil_ciudad").value,
        descripcion: document.getElementById("perfil_descripcion").value
    };

    try {
        // Actualizar datos de texto
        const respuesta = await fetch("https://runfun-0epk.onrender.com/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(datos)
        });

        // Subir foto si seleccionó algún archivo
        const archivoInput = document.getElementById("perfil_foto");
        if (archivoInput && archivoInput.files.length > 0) {
            const formData = new FormData();
            formData.append("foto", archivoInput.files[0]);

            await fetch("https://runfun-0epk.onrender.com/me/foto", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });
        }

        alert("Perfil actualizado correctamente");
        await abrirPerfil();

    } catch (error) {
        console.error("Error al guardar perfil:", error);
        alert("Ocurrió un error al guardar los cambios.");
    }
}