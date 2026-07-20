async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const respuesta = await apiLogin(email, password);

        console.log("LOGIN RESPONSE:", respuesta.data);
        console.log("ID:", respuesta.data.id);

        if (respuesta.ok && respuesta.data.access_token) {

            localStorage.setItem(
                "token",
                respuesta.data.access_token
            );

            localStorage.setItem(
            "user_id",
              respuesta.data.id
                );localStorage.setItem(
                 "user_id",
              respuesta.data.id
            );

            document.getElementById("login-view").style.display = "none";
            document.getElementById("app-view").style.display = "block";

            cargarDashboard();

        } else {

            localStorage.removeItem("token");

            document.getElementById("mensaje").innerText =
                respuesta.data.error || "Error de login";
        }

    } catch (error) {

        console.log(error);

        document.getElementById("mensaje").innerText =
            "No se pudo conectar con el servidor";
    }
}

async function abrirRegistro(){

    document.getElementById("login-view").style.display="none";

    document.getElementById("registro-view").style.display="block";

}


async function volverLogin(){

    document.getElementById("registro-view").style.display="none";

    document.getElementById("login-view").style.display="block";

}

async function registrarUsuario(){

    const datos = {

        nombre: document.getElementById("reg_nombre").value,

        apellido: document.getElementById("reg_apellido").value,

        email: document.getElementById("reg_email").value,

        password: document.getElementById("reg_password").value,

        edad: document.getElementById("reg_edad").value,

        pais: document.getElementById("reg_pais").value,

        ciudad: document.getElementById("reg_ciudad").value

    };


    try {


       const respuesta = await apiRegistrarUsuario(datos);

       const resultado = respuesta.data;

        console.log("Registro:", resultado);

        if(respuesta.ok){


            document.getElementById("mensaje-registro").innerHTML =
                "Usuario creado correctamente ✅";


            setTimeout(()=>{

                volverLogin();

            },1500);

        }else{

            document.getElementById("mensaje-registro").innerHTML =
                resultado.detail || "Error al registrar usuario";

        }

    } catch(error){

        console.log(error);

        document.getElementById("mensaje-registro").innerHTML =
            "No se pudo conectar con el servidor";

    }
}

async function verificarSesion() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const respuesta = await apiDashboard(token);

        if (respuesta.ok) {

            document.getElementById("login-view").style.display = "none";
            document.getElementById("registro-view").style.display = "none";
            document.getElementById("app-view").style.display = "block";

            await cargarDashboard();

        } else {

            localStorage.removeItem("token");
            localStorage.removeItem("user_id");

        }

    } catch (error) {

        console.log(error);

    }

}

window.addEventListener("DOMContentLoaded", verificarSesion);