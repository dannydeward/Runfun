function invitarAmigo() {

    const userId = localStorage.getItem("user_id");

    const link = `http://localhost:5500/invite?user=${userId}`;

    const html = `
        <div class="top-bar">
            <button onclick="backScreen()">⬅</button>
            <button onclick="salir()">🚪</button>
        </div>

        <h3>🎁 Invitar amigos</h3>

        <p>Comparte este enlace con tus amigos para que se registren en RunFun.</p>

        <input
            value="${link}"
            readonly
            style="width:100%;margin-bottom:15px;"
        />

        <button onclick="
            navigator.clipboard.writeText('${link}');
            alert('✅ Link copiado al portapapeles');
        ">
            📋 Copiar enlace
        </button>
    `;

    setScreen(html);

}