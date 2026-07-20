let stack = [];

function setScreen(html) {
    const app = document.getElementById("app-view");

    stack.push(app.innerHTML);
    app.innerHTML = html;
}

function backScreen() {
    const app = document.getElementById("app-view");

    if (stack.length > 0) {
        app.innerHTML = stack.pop();
    }
}

function salir() {
    location.reload(); // o limpiar token si tienes auth
}
