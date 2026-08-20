// =========================================================
// DITS - INDEX.JS
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

let map = null;
let marcador = null;
let platillos = {};


// =========================================================
// VARIABLES DE CÁMARA
// =========================================================

let streamCamara = null;
let camaraActiva = false;


// =========================================================
// FOTO ACTUAL DEL PLATILLO
// IMPORTANTE: window para que db.js pueda utilizarla
// =========================================================

window.fotoActual = "";


// =========================================================
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚ MATERIALIZE
    // =====================================================

    const menus = document.querySelectorAll(".sidenav");

    if (typeof M !== "undefined" && menus.length > 0) {
        M.Sidenav.init(menus);
    }


    // =====================================================
    // INICIAR MAPA
    // =====================================================

    iniciarMapa();


    // =====================================================
    // CARGAR PLATILLOS EN SELECT
    // =====================================================

    cargarPlatillos();


    // =====================================================
    // CARGAR PLATILLOS CREADOS EN EL INDEX
    // =====================================================

    cargarPlatillosEnIndex();


    // =====================================================
    // CARGAR PEDIDOS EN INDEX
    // =====================================================

    cargarPedidosEnIndex();


    // =====================================================
    // CAMBIO DE PLATILLO
    // =====================================================

    const lista =
        document.getElementById("listaplatillos");

    if (lista) {

        lista.addEventListener(
            "change",
            function () {

                mostrarInformacionPlatillo(
                    this.value
                );

            }
        );

    }


    // =====================================================
    // BOTÓN UBICACIÓN
    // =====================================================

    const btnUbicacion =
        document.getElementById("btnUbicacion");

    if (btnUbicacion) {

        btnUbicacion.addEventListener(
            "click",
            obtenerUbicacion
        );

    }


    // =====================================================
    // CANCELAR
    // =====================================================

    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            limpiarPedido
        );

    }


    // =====================================================
    // GUARDAR PEDIDO
    // =====================================================

    const btnGuardar =
        document.getElementById("btnGuardar");

    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            guardarPedido
        );

    }


    // =====================================================
    // ELIMINAR PEDIDOS
    // =====================================================

    const contenedor =
        document.querySelector(".recipes");

    if (contenedor) {

        contenedor.addEventListener(
            "click",
            function (e) {

                const boton =
                    e.target.closest(
                        ".btn-eliminar-pedido"
                    );

                if (!boton) {
                    return;
                }

                const id =
                    boton.getAttribute("data-id");

                if (!id) {
                    return;
                }

                eliminarPedido(id);

            }
        );

    }


    // =====================================================
    // INICIAR CÁMARA
    // =====================================================

    iniciarControlesCamara();

});


// =========================================================
// MAPA
// =========================================================

function iniciarMapa() {

    const mapaElemento =
        document.getElementById("map");

    if (!mapaElemento) {
        return;
    }


    if (typeof L === "undefined") {

        console.error(
            "Leaflet no está disponible."
        );

        return;

    }


    const posicionInicial = [
        19.4326,
        -99.1332
    ];


    map = L.map("map").setView(
        posicionInicial,
        12
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    marcador =
        L.marker(
            posicionInicial
        ).addTo(map);


    marcador.bindPopup(
        "Ubicación inicial"
    );

}


// =========================================================
// CARGAR PLATILLOS EN SELECT
// =========================================================

function cargarPlatillos() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está inicializado."
        );

        return;

    }


    const select =
        document.getElementById(
            "listaplatillos"
        );


    if (!select) {
        return;
    }


    db.collection("platillos")
        .onSnapshot(

            function (coleccion) {

                select.innerHTML = `
                    <option
                        value=""
                        selected
                    >
                        -- Selecciona un platillo --
                    </option>
                `;


                platillos = {};


                coleccion.forEach(
                    function (documento) {

                        const datos =
                            documento.data();

                        const id =
                            documento.id;


                        platillos[id] =
                            datos;


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            id;


                        option.textContent =
                            datos.nombre ||
                            "Platillo";


                        select.appendChild(
                            option
                        );

                    }
                );


                if (
                    typeof M !== "undefined"
                ) {

                    M.FormSelect.init(
                        select
                    );

                }

            },

            function (error) {

                console.error(
                    "Error cargando platillos:",
                    error
                );

            }

        );

}


// =========================================================
// CARGAR PLATILLOS DIRECTAMENTE EN INDEX
// =========================================================

function cargarPlatillosEnIndex() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está disponible."
        );

        return;

    }


    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    db.collection("platillos")
        .onSnapshot(

            function (coleccion) {

                const idsActuales = [];


                coleccion.forEach(
                    function (documento) {

                        const datos =
                            documento.data();

                        const id =
                            documento.id;


                        idsActuales.push(id);


                        const platillo = {

                            nombre:
                                datos.nombre ||
                                "Sin nombre",

                            ingredientes:
                                datos.ingredientes ||
                                "Sin ingredientes",

                            precio:
                                parseFloat(
                                    datos.precio || 0
                                ),

                            foto:
                                datos.foto ||
                                ""

                        };


                        const tarjetaExistente =
                            document.getElementById(
                                "platillo_" + id
                            );


                        if (!tarjetaExistente) {

                            mostrarPlatilloEnIndex(
                                platillo,
                                id
                            );

                        }
                        else {

                            actualizarPlatilloEnIndex(
                                platillo,
                                id
                            );

                        }

                    }
                );


                // =============================================
                // ELIMINAR TARJETAS QUE YA NO EXISTAN
                // =============================================

                const tarjetas =
                    contenedor.querySelectorAll(
                        ".platillo-directo"
                    );


                tarjetas.forEach(
                    function (tarjeta) {

                        const id =
                            tarjeta.getAttribute(
                                "data-id"
                            );


                        if (
                            id &&
                            !idsActuales.includes(id)
                        ) {

                            tarjeta.remove();

                        }

                    }
                );

            },

            function (error) {

                console.error(
                    "Error cargando platillos en index:",
                    error
                );

            }

        );

}


// =========================================================
// MOSTRAR PLATILLO DIRECTO EN INDEX
// =========================================================

function mostrarPlatilloEnIndex(
    platillo,
    id
) {

    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    const tarjeta =
        document.createElement("div");


    tarjeta.className =
        "card-panel recipe white row platillo-directo";


    tarjeta.id =
        "platillo_" + id;


    tarjeta.setAttribute(
        "data-id",
        id
    );


    tarjeta.innerHTML =
        crearHTMLPlatilloDirecto(
            platillo
        );


    contenedor.appendChild(
        tarjeta
    );

}


// =========================================================
// ACTUALIZAR PLATILLO DIRECTO
// =========================================================

function actualizarPlatilloEnIndex(
    platillo,
    id
) {

    const tarjeta =
        document.getElementById(
            "platillo_" + id
        );


    if (!tarjeta) {
        return;
    }


    tarjeta.innerHTML =
        crearHTMLPlatilloDirecto(
            platillo
        );

}


// =========================================================
// HTML DEL PLATILLO DIRECTO
// SOLO FOTO + NOMBRE + INGREDIENTES + PRECIO
// =========================================================

function crearHTMLPlatilloDirecto(
    platillo
) {

    let imagenHTML = "";


    if (
        platillo.foto &&
        typeof platillo.foto === "string" &&
        platillo.foto.trim() !== ""
    ) {

        imagenHTML = `
            <img
                src="${platillo.foto}"
                alt="${escapeHTML(platillo.nombre)}"
                style="
                    width:110px;
                    height:110px;
                    object-fit:cover;
                    border-radius:10px;
                    margin-right:15px;
                    flex-shrink:0;
                "
            >
        `;

    }

    else {

        imagenHTML = `
            <div
                style="
                    width:110px;
                    height:110px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#eeeeee;
                    border-radius:10px;
                    margin-right:15px;
                    flex-shrink:0;
                "
            >

                <i
                    class="material-icons grey-text"
                    style="font-size:50px;"
                >
                    restaurant
                </i>

            </div>
        `;

    }


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    return `

        <div
            style="
                display:flex;
                align-items:flex-start;
                width:100%;
            "
        >

            ${imagenHTML}


            <div
                class="recipe-details"
                style="flex:1;"
            >

                <div
                    class="recipe-title"
                    style="
                        font-size:20px;
                        font-weight:bold;
                        margin-bottom:8px;
                    "
                >
                    ${escapeHTML(platillo.nombre)}
                </div>


                <div
                    class="recipe-ingredients"
                    style="
                        margin-bottom:8px;
                    "
                >
                    <strong>
                        Ingredientes:
                    </strong>

                    ${escapeHTML(platillo.ingredientes)}
                </div>


                <div
                    class="recipe-price"
                    style="
                        font-weight:bold;
                        margin-bottom:8px;
                    "
                >
                    $${precio.toFixed(2)} MXN
                </div>

            </div>

        </div>

    `;

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escapeHTML(texto) {

    if (texto === null || texto === undefined) {
        return "";
    }


    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// CARGAR PEDIDOS EN INDEX
// =========================================================

function cargarPedidosEnIndex() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está disponible."
        );

        return;

    }


    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    db.collection("pedidos")
        .onSnapshot(

            function (coleccion) {

                const idsActuales = [];


                coleccion.forEach(
                    function (documento) {

                        const pedido =
                            documento.data();

                        const id =
                            documento.id;


                        idsActuales.push(id);


                        const platillo = {

                            nombre:
                                pedido.platillo ||
                                "Sin nombre",

                            ingredientes:
                                pedido.ingredientes ||
                                "Sin ingredientes",

                            precio:
                                parseFloat(
                                    pedido.precio || 0
                                ),

                            foto:
                                pedido.foto ||
                                ""

                        };


                        const tarjetaExistente =
                            document.getElementById(
                                "pedido_" + id
                            );


                        if (!tarjetaExistente) {

                            mostrarPedidoEnIndex(
                                platillo,
                                id,
                                pedido
                            );

                        }
                        else {

                            actualizarPedidoEnIndex(
                                platillo,
                                id,
                                pedido
                            );

                        }

                    }
                );


                const tarjetas =
                    contenedor.querySelectorAll(
                        ".pedido-directo"
                    );


                tarjetas.forEach(
                    function (tarjeta) {

                        const id =
                            tarjeta.getAttribute(
                                "data-id"
                            );


                        if (
                            id &&
                            !idsActuales.includes(id)
                        ) {

                            tarjeta.remove();

                        }

                    }
                );

            },

            function (error) {

                console.error(
                    "Error cargando pedidos:",
                    error
                );

            }

        );

}


// =========================================================
// MOSTRAR PEDIDO EN INDEX
// =========================================================

function mostrarPedidoEnIndex(
    platillo,
    id,
    pedido
) {

    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    const tarjeta =
        document.createElement("div");


    tarjeta.className =
        "card-panel recipe white row pedido-directo";


    tarjeta.id =
        "pedido_" + id;


    tarjeta.setAttribute(
        "data-id",
        id
    );


    tarjeta.innerHTML =
        crearHTMLPedido(
            platillo,
            pedido
        );


    contenedor.appendChild(
        tarjeta
    );

}


// =========================================================
// ACTUALIZAR PEDIDO
// =========================================================

function actualizarPedidoEnIndex(
    platillo,
    id,
    pedido
) {

    const tarjeta =
        document.getElementById(
            "pedido_" + id
        );


    if (!tarjeta) {
        return;
    }


    tarjeta.innerHTML =
        crearHTMLPedido(
            platillo,
            pedido
        );

}


// =========================================================
// HTML DEL PEDIDO
// =========================================================

function crearHTMLPedido(
    platillo,
    pedido
) {

    let imagenHTML = "";


    if (
        platillo.foto &&
        typeof platillo.foto === "string" &&
        platillo.foto.trim() !== ""
    ) {

        imagenHTML = `
            <img
                src="${platillo.foto}"
                alt="${escapeHTML(platillo.nombre)}"
                style="
                    width:110px;
                    height:110px;
                    object-fit:cover;
                    border-radius:10px;
                    margin-right:15px;
                    flex-shrink:0;
                "
            >
        `;

    }

    else {

        imagenHTML = `
            <div
                style="
                    width:110px;
                    height:110px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#eeeeee;
                    border-radius:10px;
                    margin-right:15px;
                    flex-shrink:0;
                "
            >

                <i
                    class="material-icons grey-text"
                    style="font-size:50px;"
                >
                    restaurant
                </i>

            </div>
        `;

    }


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    const cliente =
        pedido &&
        pedido.nombreCliente
            ? pedido.nombreCliente
            : "";


    const direccion =
        pedido &&
        pedido.direccion
            ? pedido.direccion
            : "";


    return `

        <div
            style="
                display:flex;
                align-items:flex-start;
                width:100%;
            "
        >

            ${imagenHTML}


            <div
                class="recipe-details"
                style="flex:1;"
            >

                <div
                    class="recipe-title"
                    style="
                        font-size:20px;
                        font-weight:bold;
                        margin-bottom:8px;
                    "
                >
                    ${escapeHTML(platillo.nombre)}
                </div>


                <div
                    class="recipe-ingredients"
                    style="
                        margin-bottom:6px;
                    "
                >
                    <strong>
                        Ingredientes:
                    </strong>

                    ${escapeHTML(platillo.ingredientes)}
                </div>


                <div
                    class="recipe-price"
                    style="
                        font-weight:bold;
                        margin-bottom:8px;
                    "
                >
                    $${precio.toFixed(2)} MXN
                </div>


                ${
                    cliente
                    ? `
                        <div
                            style="
                                margin-top:5px;
                                font-size:13px;
                            "
                        >

                            <strong>
                                Cliente:
                            </strong>

                            ${escapeHTML(cliente)}

                        </div>
                    `
                    : ""
                }


                ${
                    direccion
                    ? `
                        <div
                            style="
                                margin-top:5px;
                                font-size:13px;
                            "
                        >

                            <strong>
                                Entrega:
                            </strong>

                            ${escapeHTML(direccion)}

                        </div>
                    `
                    : ""
                }


                <div
                    class="recipe-delete"
                    style="
                        margin-top:12px;
                    "
                >

                    <button
                        type="button"
                        class="
                            btn
                            red
                            waves-effect
                            waves-light
                            btn-eliminar-pedido
                        "
                        data-id="${pedido.id || ""}"
                    >

                        <i class="material-icons left">
                            delete
                        </i>

                        Eliminar

                    </button>

                </div>

            </div>

        </div>

    `;

}


// =========================================================
// ELIMINAR PEDIDO
// =========================================================

function eliminarPedido(id) {

    if (!id) {
        return;
    }


    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este pedido?"
        );


    if (!confirmar) {
        return;
    }


    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;

    }


    const tarjeta =
        document.getElementById(
            "pedido_" + id
        );


    if (tarjeta) {

        tarjeta.style.transition =
            "opacity 0.2s ease, transform 0.2s ease";

        tarjeta.style.opacity =
            "0";

        tarjeta.style.transform =
            "scale(0.95)";


        setTimeout(
            function () {

                if (tarjeta) {
                    tarjeta.remove();
                }

            },
            200
        );

    }


    db.collection("pedidos")
        .doc(id)
        .delete()

        .then(
            function () {

                console.log(
                    "Pedido eliminado:",
                    id
                );


                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "Pedido eliminado"
                    });

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error eliminando pedido:",
                    error
                );


                alert(
                    "No se pudo eliminar el pedido."
                );

            }
        );

}


// =========================================================
// MOSTRAR INFORMACIÓN DEL PLATILLO
// =========================================================

function mostrarInformacionPlatillo(id) {

    const ingredientesVista =
        document.getElementById(
            "ingredientesVista"
        );


    const costoVista =
        document.getElementById(
            "costoVista"
        );


    const ingredientesInput =
        document.getElementById(
            "txtIngredientes"
        );


    const costoInput =
        document.getElementById(
            "txtCosto"
        );


    if (!id || !platillos[id]) {

        if (ingredientesVista) {
            ingredientesVista.textContent =
                "Selecciona un platillo";
        }


        if (costoVista) {
            costoVista.textContent =
                "$0.00 MXN";
        }


        if (ingredientesInput) {
            ingredientesInput.value =
                "";
        }


        if (costoInput) {
            costoInput.value =
                "$0.00 MXN";
        }


        return;

    }


    const platillo =
        platillos[id];


    const ingredientes =
        platillo.ingredientes ||
        "No especificados";


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    if (ingredientesVista) {
        ingredientesVista.textContent =
            ingredientes;
    }


    if (costoVista) {
        costoVista.textContent =
            `$${precio.toFixed(2)} MXN`;
    }


    if (ingredientesInput) {
        ingredientesInput.value =
            ingredientes;
    }


    if (costoInput) {
        costoInput.value =
            `$${precio.toFixed(2)} MXN`;
    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }

}


// =========================================================
// OBTENER UBICACIÓN
// =========================================================

function obtenerUbicacion() {

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


    if (!navigator.geolocation) {

        mostrarEstado(
            "Tu navegador no permite obtener la ubicación.",
            true
        );

        return;

    }


    if (btn) {

        btn.disabled = true;

        btn.innerHTML = `
            <i class="material-icons left">
                location_searching
            </i>
            Obteniendo...
        `;

    }


    mostrarEstado(
        "Solicitando tu ubicación...",
        false
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitud =
                position.coords.latitude;


            const longitud =
                position.coords.longitude;


            const txtLatitud =
                document.getElementById(
                    "txtLatitud"
                );


            const txtLongitud =
                document.getElementById(
                    "txtLongitud"
                );


            if (txtLatitud) {
                txtLatitud.value =
                    latitud;
            }


            if (txtLongitud) {
                txtLongitud.value =
                    longitud;
            }


            const latitudVista =
                document.getElementById(
                    "latitudVista"
                );


            const longitudVista =
                document.getElementById(
                    "longitudVista"
                );


            if (latitudVista) {
                latitudVista.textContent =
                    latitud.toFixed(6);
            }


            if (longitudVista) {
                longitudVista.textContent =
                    longitud.toFixed(6);
            }


            if (map) {

                map.setView(
                    [
                        latitud,
                        longitud
                    ],
                    17
                );

            }


            if (marcador) {

                marcador.setLatLng([
                    latitud,
                    longitud
                ]);


                marcador.bindPopup(
                    "Tu ubicación"
                );


                marcador.openPopup();

            }


            obtenerDireccion(
                latitud,
                longitud
            );

        },

        function (error) {

            console.error(
                "Error de geolocalización:",
                error
            );


            let mensaje =
                "No se pudo obtener tu ubicación.";


            switch (error.code) {

                case error.PERMISSION_DENIED:
                    mensaje =
                        "Permiso de ubicación denegado.";
                    break;

                case error.POSITION_UNAVAILABLE:
                    mensaje =
                        "La ubicación no está disponible.";
                    break;

                case error.TIMEOUT:
                    mensaje =
                        "Se agotó el tiempo para obtener la ubicación.";
                    break;

            }


            mostrarEstado(
                mensaje,
                true
            );


            restaurarBotonUbicacion();

        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }

    );

}


// =========================================================
// OBTENER DIRECCIÓN
// =========================================================

async function obtenerDireccion(
    latitud,
    longitud
) {

    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    if (direccion) {
        direccion.value =
            "Buscando dirección...";
    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }


    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitud)}&lon=${encodeURIComponent(longitud)}&zoom=18&addressdetails=1`;


        const respuesta =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo consultar la dirección."
            );

        }


        const datos =
            await respuesta.json();


        const address =
            datos.address || {};


        const calle =
            address.road ||
            address.pedestrian ||
            address.footway ||
            address.path ||
            "";


        const numero =
            address.house_number ||
            "";


        const colonia =
            address.suburb ||
            address.neighbourhood ||
            address.quarter ||
            "";


        const ciudad =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";


        const estado =
            address.state ||
            "";


        const codigoPostal =
            address.postcode ||
            "";


        let direccionFinal = "";


        if (calle) {
            direccionFinal += calle;
        }


        if (numero) {
            direccionFinal +=
                " " + numero;
        }


        if (colonia) {
            direccionFinal +=
                ", " + colonia;
        }


        if (ciudad) {
            direccionFinal +=
                ", " + ciudad;
        }


        if (estado) {
            direccionFinal +=
                ", " + estado;
        }


        if (codigoPostal) {
            direccionFinal +=
                ", C.P. " + codigoPostal;
        }


        if (!direccionFinal.trim()) {

            direccionFinal =
                datos.display_name ||
                `${latitud}, ${longitud}`;

        }


        if (direccion) {
            direccion.value =
                direccionFinal;
        }


        if (typeof M !== "undefined") {
            M.updateTextFields();
        }


        mostrarEstado(
            "✓ Ubicación encontrada correctamente.",
            false
        );


        restaurarBotonUbicacion(true);


        if (marcador) {

            marcador.bindPopup(
                `<strong>Ubicación de entrega</strong><br>${escapeHTML(direccionFinal)}`
            );


            marcador.openPopup();

        }

    }

    catch (error) {

        console.error(
            "Error obteniendo dirección:",
            error
        );


        if (direccion) {

            direccion.value =
                `${latitud}, ${longitud}`;

        }


        if (typeof M !== "undefined") {
            M.updateTextFields();
        }


        mostrarEstado(
            "Ubicación obtenida, pero no se pudo convertir en dirección.",
            true
        );


        restaurarBotonUbicacion();

    }

}


// =========================================================
// MOSTRAR ESTADO
// =========================================================

function mostrarEstado(
    mensaje,
    error
) {

    const elemento =
        document.getElementById(
            "estadoUbicacion"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        error
            ? "red-text"
            : "green-text";

}


// =========================================================
// RESTAURAR BOTÓN UBICACIÓN
// =========================================================

function restaurarBotonUbicacion(
    correcto = false
) {

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


    if (!btn) {
        return;
    }


    btn.disabled = false;


    if (correcto) {

        btn.innerHTML = `
            <i class="material-icons left">
                check
            </i>
            Ubicación obtenida
        `;

    }

    else {

        btn.innerHTML = `
            <i class="material-icons left">
                location_on
            </i>
            Obtener ubicación
        `;

    }

}


// =========================================================
// GUARDAR PEDIDO
// =========================================================

function guardarPedido() {

    const lista =
        document.getElementById(
            "listaplatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    const ingredientes =
        document.getElementById(
            "txtIngredientes"
        );


    const costo =
        document.getElementById(
            "txtCosto"
        );


    const latitud =
        document.getElementById(
            "txtLatitud"
        );


    const longitud =
        document.getElementById(
            "txtLongitud"
        );


    if (!lista || !lista.value) {

        alert(
            "Selecciona un platillo."
        );

        return;

    }


    if (
        !nombre ||
        !nombre.value.trim()
    ) {

        alert(
            "Ingresa tu nombre."
        );


        if (nombre) {
            nombre.focus();
        }


        return;

    }


    if (
        !direccion ||
        !direccion.value.trim()
    ) {

        alert(
            "Ingresa u obtén tu dirección."
        );


        if (direccion) {
            direccion.focus();
        }


        return;

    }


    const platillo =
        platillos[lista.value];


    if (!platillo) {

        alert(
            "No se encontró la información del platillo."
        );

        return;

    }


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    const pedido = {

        platilloId:
            lista.value,

        platillo:
            platillo.nombre || "",

        ingredientes:
            platillo.ingredientes || "",

        precio:
            precio,

        foto:
            platillo.foto || "",

        nombreCliente:
            nombre.value.trim(),

        direccion:
            direccion.value.trim(),

        latitud:
            latitud &&
            latitud.value
                ? parseFloat(latitud.value)
                : null,

        longitud:
            longitud &&
            longitud.value
                ? parseFloat(longitud.value)
                : null,

        fecha:
            new Date().toISOString()

    };


    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;

    }


    const btn =
        document.getElementById(
            "btnGuardar"
        );


    if (btn) {

        btn.disabled = true;

        btn.innerHTML = `
            <i class="material-icons left">
                hourglass_empty
            </i>
            Guardando...
        `;

    }


    db.collection("pedidos")
        .add(pedido)

        .then(
            function (docRef) {

                console.log(
                    "Pedido guardado:",
                    docRef.id
                );


                return db.collection("pedidos")
                    .doc(docRef.id)
                    .update({
                        id: docRef.id
                    });

            }
        )

        .then(
            function () {

                window.location.href =
                    "../index.html";

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error guardando pedido:",
                    error
                );


                alert(
                    "Ocurrió un error al guardar el pedido."
                );

            }
        )

        .finally(
            function () {

                if (btn) {

                    btn.disabled = false;

                    btn.innerHTML = `
                        <i class="material-icons left">
                            save
                        </i>
                        Guardar pedido
                    `;

                }

            }
        );

}


// =========================================================
// LIMPIAR PEDIDO
// =========================================================

function limpiarPedido() {

    const lista =
        document.getElementById(
            "listaplatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    const ingredientes =
        document.getElementById(
            "txtIngredientes"
        );


    const costo =
        document.getElementById(
            "txtCosto"
        );


    const latitud =
        document.getElementById(
            "txtLatitud"
        );


    const longitud =
        document.getElementById(
            "txtLongitud"
        );


    if (lista) {
        lista.value = "";
    }


    if (nombre) {
        nombre.value = "";
    }


    if (direccion) {
        direccion.value = "";
    }


    if (ingredientes) {
        ingredientes.value = "";
    }


    if (costo) {
        costo.value = "$0.00 MXN";
    }


    if (latitud) {
        latitud.value = "";
    }


    if (longitud) {
        longitud.value = "";
    }


    const ingredientesVista =
        document.getElementById(
            "ingredientesVista"
        );


    const costoVista =
        document.getElementById(
            "costoVista"
        );


    if (ingredientesVista) {
        ingredientesVista.textContent =
            "Selecciona un platillo";
    }


    if (costoVista) {
        costoVista.textContent =
            "$0.00 MXN";
    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }


    mostrarEstado(
        "",
        false
    );

}


// =========================================================
// CÁMARA
// =========================================================

function iniciarControlesCamara() {

    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    const btnCapturar =
        document.getElementById(
            "btnCapturar"
        );


    const btnLimpiar =
        document.getElementById(
            "btnLimpiar"
        );


    const btnFoto =
        document.getElementById(
            "btnFoto"
        );


    const video =
        document.getElementById(
            "Video"
        );


    const canvas =
        document.getElementById(
            "Canvas"
        );


    const foto =
        document.getElementById(
            "foto"
        );


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    const cameraStatus =
        document.getElementById(
            "cameraStatus"
        );


    const cameraError =
        document.getElementById(
            "cameraError"
        );


    if (
        !btnCamara ||
        !btnCapturar ||
        !btnLimpiar ||
        !video ||
        !canvas
    ) {

        console.log(
            "Elementos de cámara no encontrados."
        );

        return;

    }


    // =====================================================
    // SELECCIONAR IMAGEN
    // =====================================================

    if (btnFoto) {

        btnFoto.addEventListener(
            "change",
            function (event) {

                const archivo =
                    event.target.files &&
                    event.target.files[0];


                if (!archivo) {
                    return;
                }


                if (
                    !archivo.type.startsWith(
                        "image/"
                    )
                ) {

                    if (cameraError) {

                        cameraError.textContent =
                            "Selecciona una imagen válida.";

                    }

                    return;

                }


                const lector =
                    new FileReader();


                lector.onload =
                    function (e) {

                        const imagen =
                            new Image();


                        imagen.onload =
                            function () {

                                const resultado =
                                    comprimirImagen(
                                        imagen
                                    );


                                // =================================
                                // GUARDAR FOTO GLOBAL
                                // =================================

                                window.fotoActual =
                                    resultado;


                                // =================================
                                // MOSTRAR FOTO
                                // =================================

                                mostrarFoto(
                                    resultado
                                );


                                console.log(
                                    "Imagen seleccionada."
                                );


                                console.log(
                                    "Tamaño:",
                                    window.fotoActual.length,
                                    "caracteres"
                                );


                                // =================================
                                // COMPROBAR TAMAÑO
                                // =================================

                                const tamanoKB =
                                    Math.round(
                                        (resultado.length * 3) / 4 / 1024
                                    );


                                console.log(
                                    "Tamaño aproximado:",
                                    tamanoKB,
                                    "KB"
                                );


                                if (cameraStatus) {

                                    cameraStatus.textContent =
                                        "✓ Imagen seleccionada correctamente.";

                                }


                                if (cameraError) {

                                    cameraError.textContent =
                                        "";

                                }

                            };


                        imagen.onerror =
                            function () {

                                if (cameraError) {

                                    cameraError.textContent =
                                        "No se pudo cargar la imagen.";

                                }

                            };


                        imagen.src =
                            e.target.result;

                    };


                lector.onerror =
                    function () {

                        if (cameraError) {

                            cameraError.textContent =
                                "No se pudo leer la imagen.";

                        }

                    };


                lector.readAsDataURL(
                    archivo
                );

            }
        );

    }


    // =====================================================
    // ABRIR CÁMARA
    // =====================================================

    btnCamara.addEventListener(
        "click",
        function () {

            abrirCamara();

        }
    );


    // =====================================================
    // CAPTURAR FOTO
    // =====================================================

    btnCapturar.addEventListener(
        "click",
        function () {

            capturarFoto();

        }
    );


    // =====================================================
    // LIMPIAR
    // =====================================================

    btnLimpiar.addEventListener(
        "click",
        function () {

            limpiarFoto();

        }
    );

}


// =========================================================
// ABRIR CÁMARA
// =========================================================

async function abrirCamara() {

    const video =
        document.getElementById(
            "Video"
        );


    const cameraStatus =
        document.getElementById(
            "cameraStatus"
        );


    const cameraError =
        document.getElementById(
            "cameraError"
        );


    if (!video) {
        return;
    }


    if (cameraError) {
        cameraError.textContent = "";
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (cameraError) {

            cameraError.textContent =
                "Tu navegador no permite usar la cámara.";

        }

        return;

    }


    detenerCamara();


    if (cameraStatus) {

        cameraStatus.textContent =
            "Solicitando permiso para usar la cámara...";

    }


    try {

        streamCamara =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });


        video.srcObject =
            streamCamara;


        video.muted =
            true;


        video.setAttribute(
            "playsinline",
            ""
        );


        await video.play();


        camaraActiva =
            true;


        if (cameraStatus) {

            cameraStatus.textContent =
                "✓ Cámara activa. Puedes tomar la foto.";

        }


        video.style.display =
            "block";

    }

    catch (error) {

        console.error(
            "Error al abrir cámara:",
            error
        );


        camaraActiva =
            false;


        let mensaje =
            "No se pudo abrir la cámara.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            mensaje =
                "Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.";

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            mensaje =
                "No se encontró ninguna cámara.";

        }

        else if (
            error.name ===
            "NotReadableError"
        ) {

            mensaje =
                "La cámara está siendo utilizada por otra aplicación.";

        }

        else if (
            error.name ===
            "SecurityError"
        ) {

            mensaje =
                "El navegador bloqueó el acceso a la cámara. Usa HTTPS o localhost.";

        }


        if (cameraError) {

            cameraError.textContent =
                mensaje;

        }


        if (cameraStatus) {

            cameraStatus.textContent =
                "Cámara no disponible.";

        }

    }

}


// =========================================================
// CAPTURAR FOTO
// =========================================================

function capturarFoto() {

    const video =
        document.getElementById(
            "Video"
        );


    const canvas =
        document.getElementById(
            "Canvas"
        );


    const foto =
        document.getElementById(
            "foto"
        );


    const cameraStatus =
        document.getElementById(
            "cameraStatus"
        );


    const cameraError =
        document.getElementById(
            "cameraError"
        );


    if (
        !video ||
        !canvas
    ) {

        return;

    }


    if (
        !streamCamara ||
        !camaraActiva ||
        video.readyState < 2
    ) {

        if (cameraError) {

            cameraError.textContent =
                "Primero activa la cámara.";

        }

        return;

    }


    const ancho =
        video.videoWidth;


    const alto =
        video.videoHeight;


    if (
        !ancho ||
        !alto
    ) {

        if (cameraError) {

            cameraError.textContent =
                "La cámara todavía no está lista.";

        }

        return;

    }


    // =====================================================
    // TAMAÑO MÁXIMO
    // =====================================================

    const maxWidth =
        700;


    let nuevoAncho =
        ancho;


    let nuevoAlto =
        alto;


    if (nuevoAncho > maxWidth) {

        nuevoAlto =
            nuevoAlto *
            (maxWidth / nuevoAncho);


        nuevoAncho =
            maxWidth;

    }


    canvas.width =
        nuevoAncho;


    canvas.height =
        nuevoAlto;


    const contexto =
        canvas.getContext(
            "2d"
        );


    contexto.drawImage(
        video,
        0,
        0,
        nuevoAncho,
        nuevoAlto
    );


    // =====================================================
    // COMPRESIÓN
    // =====================================================

    const imagen =
        canvas.toDataURL(
            "image/jpeg",
            0.55
        );


    // =====================================================
    // GUARDAR FOTO GLOBAL
    // =====================================================

    window.fotoActual =
        imagen;


    // =====================================================
    // MOSTRAR FOTO
    // =====================================================

    if (foto) {

        foto.src =
            imagen;

        foto.style.display =
            "block";

    }


    // =====================================================
    // DEBUG
    // =====================================================

    const tamanoKB =
        Math.round(
            (imagen.length * 3) / 4 / 1024
        );


    console.log(
        "================================="
    );


    console.log(
        "FOTO CAPTURADA"
    );


    console.log(
        "Existe:",
        window.fotoActual !== ""
    );


    console.log(
        "Tamaño:",
        window.fotoActual.length,
        "caracteres"
    );


    console.log(
        "Tamaño aproximado:",
        tamanoKB,
        "KB"
    );


    console.log(
        "================================="
    );


    if (cameraStatus) {

        cameraStatus.textContent =
            "✓ Foto capturada correctamente.";

    }


    if (cameraError) {

        cameraError.textContent =
            "";

    }

}


// =========================================================
// COMPRIMIR IMAGEN
// =========================================================

function comprimirImagen(
    imagen
) {

    const canvas =
        document.createElement(
            "canvas"
        );


    // =============================================
    // REDUCIMOS MÁS LA IMAGEN
    // =============================================

    const maxWidth =
        700;


    let ancho =
        imagen.width;


    let alto =
        imagen.height;


    if (ancho > maxWidth) {

        alto =
            alto *
            (maxWidth / ancho);


        ancho =
            maxWidth;

    }


    canvas.width =
        ancho;


    canvas.height =
        alto;


    const contexto =
        canvas.getContext(
            "2d"
        );


    contexto.drawImage(
        imagen,
        0,
        0,
        ancho,
        alto
    );


    return canvas.toDataURL(
        "image/jpeg",
        0.55
    );

}


// =========================================================
// MOSTRAR FOTO
// =========================================================

function mostrarFoto(
    imagen
) {

    const foto =
        document.getElementById(
            "foto"
        );


    if (!foto) {
        return;
    }


    foto.src =
        imagen;


    foto.style.display =
        "block";

}


// =========================================================
// LIMPIAR FOTO
// =========================================================

function limpiarFoto() {

    // =====================================================
    // LIMPIAR VARIABLE GLOBAL
    // =====================================================

    window.fotoActual =
        "";


    const foto =
        document.getElementById(
            "foto"
        );


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    const btnFoto =
        document.getElementById(
            "btnFoto"
        );


    const cameraStatus =
        document.getElementById(
            "cameraStatus"
        );


    const cameraError =
        document.getElementById(
            "cameraError"
        );


    if (foto) {

        foto.src =
            "";

        foto.style.display =
            "none";

    }


    if (fotoInput) {

        fotoInput.value =
            "";

    }


    if (btnFoto) {

        btnFoto.value =
            "";

    }


    if (cameraError) {

        cameraError.textContent =
            "";

    }


    if (cameraStatus) {

        cameraStatus.textContent =
            "Cámara lista para tomar una foto.";

    }

}


// =========================================================
// DETENER CÁMARA
// =========================================================

function detenerCamara() {

    if (streamCamara) {

        streamCamara
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

    }


    streamCamara =
        null;


    camaraActiva =
        false;


    const video =
        document.getElementById(
            "Video"
        );


    if (video) {

        video.srcObject =
            null;

    }

}


// =========================================================
// DETENER CÁMARA AL SALIR
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        detenerCamara();

    }
);


// =========================================================
// ACTUALIZAR MAPA AL CAMBIAR TAMAÑO
// =========================================================

window.addEventListener(
    "resize",
    function () {

        if (map) {

            setTimeout(
                function () {

                    map.invalidateSize();

                },
                200
            );

        }

    }
);
    // =====================================================
    // CARGAR PLATILLOS
    // =====================================================

    cargarPlatillos();


    // =====================================================
    // CARGAR PEDIDOS EN INDEX
    // =====================================================

    cargarPedidosEnIndex();


    // =====================================================
    // CAMBIO DE PLATILLO
    // =====================================================

    const lista = document.getElementById("listaplatillos");

    if (lista) {

        lista.addEventListener("change", function () {

            mostrarInformacionPlatillo(this.value);

        });

    }


    // =====================================================
    // BOTÓN UBICACIÓN
    // =====================================================

    const btnUbicacion =
        document.getElementById("btnUbicacion");

    if (btnUbicacion) {

        btnUbicacion.addEventListener(
            "click",
            obtenerUbicacion
        );

    }


    // =====================================================
    // CANCELAR
    // =====================================================

    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            limpiarPedido
        );

    }


    // =====================================================
    // GUARDAR
    // =====================================================

    const btnGuardar =
        document.getElementById("btnGuardar");

    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            guardarPedido
        );

    }


    // =====================================================
    // ELIMINAR PEDIDOS
    // =====================================================

    const contenedor =
        document.querySelector(".recipes");

    if (contenedor) {

        contenedor.addEventListener("click", function (e) {

            const boton =
                e.target.closest(".btn-eliminar-pedido");

            if (!boton) {
                return;
            }

            const id =
                boton.getAttribute("data-id");

            if (!id) {
                return;
            }

            eliminarPedido(id);

        });

    }

});


// =========================================================
// INICIAR MAPA
// =========================================================

function iniciarMapa() {

    const mapaElemento =
        document.getElementById("map");

    if (!mapaElemento) {
        return;
    }


    const posicionInicial = [
        19.4326,
        -99.1332
    ];


    map = L.map("map").setView(
        posicionInicial,
        12
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    marcador =
        L.marker(
            posicionInicial
        ).addTo(map);


    marcador.bindPopup(
        "Ubicación inicial"
    );

}


// =========================================================
// CARGAR PLATILLOS
// =========================================================

function cargarPlatillos() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está inicializado."
        );

        return;
    }


    const select =
        document.getElementById(
            "listaplatillos"
        );


    if (!select) {
        return;
    }


    db.collection("platillos")
        .onSnapshot(

            function (coleccion) {

                select.innerHTML = `
                    <option value="" selected>
                        -- Selecciona un platillo --
                    </option>
                `;


                platillos = {};


                coleccion.forEach(
                    function (documento) {

                        const datos =
                            documento.data();

                        const id =
                            documento.id;


                        platillos[id] =
                            datos;


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            id;


                        option.textContent =
                            datos.nombre ||
                            "Platillo";


                        select.appendChild(
                            option
                        );

                    }
                );

            },

            function (error) {

                console.error(
                    "Error cargando platillos:",
                    error
                );

            }

        );

}


// =========================================================
// CARGAR PEDIDOS EN INDEX
// =========================================================

function cargarPedidosEnIndex() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está disponible."
        );

        return;
    }


    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    db.collection("pedidos")
        .onSnapshot(

            function (coleccion) {

                // =================================================
                // ACTUALIZAR LA INTERFAZ SEGÚN FIRESTORE
                // =================================================

                const idsActuales = [];


                coleccion.forEach(
                    function (documento) {

                        const pedido =
                            documento.data();

                        const id =
                            documento.id;

                        idsActuales.push(id);


                        // =========================================
                        // DATOS DEL PEDIDO
                        // =========================================

                        const platillo = {

                            nombre:
                                pedido.platillo ||
                                "Sin nombre",

                            ingredientes:
                                pedido.ingredientes ||
                                "Sin ingredientes",

                            precio:
                                parseFloat(
                                    pedido.precio || 0
                                ),

                            foto:
                                pedido.foto ||
                                ""

                        };


                        // =========================================
                        // BUSCAR TARJETA EXISTENTE
                        // =========================================

                        const tarjetaExistente =
                            document.getElementById(
                                "pedido_" + id
                            );


                        // =========================================
                        // SI NO EXISTE, CREARLA
                        // =========================================

                        if (!tarjetaExistente) {

                            mostrarPedidoEnIndex(
                                platillo,
                                id,
                                pedido
                            );

                        }

                    }
                );


                // =================================================
                // ELIMINAR DE LA PANTALLA LOS PEDIDOS
                // QUE YA NO EXISTEN EN FIRESTORE
                // =================================================

                const tarjetas =
                    contenedor.querySelectorAll(
                        ".recipe"
                    );


                tarjetas.forEach(
                    function (tarjeta) {

                        const id =
                            tarjeta.getAttribute(
                                "data-id"
                            );


                        if (
                            id &&
                            !idsActuales.includes(id)
                        ) {

                            tarjeta.remove();

                        }

                    }
                );

            },

            function (error) {

                console.error(
                    "Error cargando pedidos:",
                    error
                );

            }

        );

}


// =========================================================
// MOSTRAR PEDIDO EN INDEX
// =========================================================

function mostrarPedidoEnIndex(
    platillo,
    id,
    pedido
) {

    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    // =====================================================
    // FOTO
    // =====================================================

    let imagenHTML = "";


    if (
        platillo.foto &&
        platillo.foto !== ""
    ) {

        imagenHTML = `
            <img
                src="${platillo.foto}"
                height="100"
                width="100"
                style="
                    object-fit: cover;
                    border-radius: 10px;
                "
            >
        `;

    }

    else {

        imagenHTML = `
            <div
                style="
                    width:100px;
                    height:100px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#eeeeee;
                    border-radius:10px;
                "
            >
                <i
                    class="material-icons grey-text"
                    style="font-size:45px;"
                >
                    restaurant
                </i>
            </div>
        `;

    }


    // =====================================================
    // PRECIO
    // =====================================================

    const precio =
        parseFloat(
            platillo.precio || 0
        );


    // =====================================================
    // CLIENTE
    // =====================================================

    const cliente =
        pedido &&
        pedido.nombreCliente
            ? pedido.nombreCliente
            : "";


    // =====================================================
    // DIRECCIÓN
    // =====================================================

    const direccion =
        pedido &&
        pedido.direccion
            ? pedido.direccion
            : "";


    // =====================================================
    // TARJETA
    // =====================================================

    const tarjeta =
        document.createElement("div");


    tarjeta.className =
        "card-panel recipe white row";


    tarjeta.id =
        "pedido_" + id;


    tarjeta.setAttribute(
        "data-id",
        id
    );


    tarjeta.innerHTML = `

        ${imagenHTML}

        <div class="recipe-details">

            <div class="recipe-title">
                ${platillo.nombre}
            </div>


            <div class="recipe-ingredients">
                ${platillo.ingredientes}
            </div>


            <div class="recipe-price">
                $${precio.toFixed(2)} MXN
            </div>


            ${
                cliente
                ? `
                    <div
                        style="
                            margin-top:5px;
                            font-size:13px;
                        "
                    >
                        <strong>Cliente:</strong>
                        ${cliente}
                    </div>
                `
                : ""
            }


            ${
                direccion
                ? `
                    <div
                        style="
                            margin-top:5px;
                            font-size:13px;
                        "
                    >
                        <strong>Entrega:</strong>
                        ${direccion}
                    </div>
                `
                : ""
            }


            <div
                class="recipe-delete"
                style="
                    margin-top:10px;
                "
            >

                <button
                    type="button"
                    class="btn red waves-effect waves-light btn-eliminar-pedido"
                    data-id="${id}"
                >

                    <i class="material-icons left">
                        delete
                    </i>

                    Eliminar

                </button>

            </div>

        </div>

    `;


    contenedor.appendChild(
        tarjeta
    );

}


// =========================================================
// ELIMINAR PEDIDO
// =========================================================

function eliminarPedido(id) {

    if (!id) {
        return;
    }


    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este pedido?"
        );


    if (!confirmar) {
        return;
    }


    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;
    }


    // =====================================================
    // TARJETA
    // =====================================================

    const tarjeta =
        document.getElementById(
            "pedido_" + id
        );


    // =====================================================
    // ELIMINAR VISUALMENTE INMEDIATAMENTE
    // =====================================================

    if (tarjeta) {

        tarjeta.style.transition =
            "opacity 0.15s ease, transform 0.15s ease";

        tarjeta.style.opacity = "0";

        tarjeta.style.transform =
            "scale(0.95)";


        setTimeout(
            function () {

                if (tarjeta) {
                    tarjeta.remove();
                }

            },
            150
        );

    }


    // =====================================================
    // ELIMINAR DE FIRESTORE
    // =====================================================

    db.collection("pedidos")
        .doc(id)
        .delete()

        .then(
            function () {

                console.log(
                    "Pedido eliminado:",
                    id
                );


                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "Pedido eliminado"
                    });

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error eliminando pedido:",
                    error
                );


                // =================================================
                // SI FALLA FIRESTORE, VOLVER A CARGAR
                // =================================================

                alert(
                    "No se pudo eliminar el pedido."
                );

            }
        );

}


// =========================================================
// MOSTRAR INFORMACIÓN DEL PLATILLO
// =========================================================

function mostrarInformacionPlatillo(id) {

    const ingredientesVista =
        document.getElementById(
            "ingredientesVista"
        );


    const costoVista =
        document.getElementById(
            "costoVista"
        );


    const ingredientesInput =
        document.getElementById(
            "txtIngredientes"
        );


    const costoInput =
        document.getElementById(
            "txtCosto"
        );


    if (!id || !platillos[id]) {

        if (ingredientesVista) {
            ingredientesVista.textContent =
                "Selecciona un platillo";
        }


        if (costoVista) {
            costoVista.textContent =
                "$0.00 MXN";
        }


        if (ingredientesInput) {
            ingredientesInput.value =
                "";
        }


        if (costoInput) {
            costoInput.value =
                "$0.00 MXN";
        }


        return;

    }


    const platillo =
        platillos[id];


    const ingredientes =
        platillo.ingredientes ||
        "No especificados";


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    if (ingredientesVista) {
        ingredientesVista.textContent =
            ingredientes;
    }


    if (costoVista) {
        costoVista.textContent =
            `$${precio.toFixed(2)} MXN`;
    }


    if (ingredientesInput) {
        ingredientesInput.value =
            ingredientes;
    }


    if (costoInput) {
        costoInput.value =
            `$${precio.toFixed(2)} MXN`;
    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }

}


// =========================================================
// OBTENER UBICACIÓN
// =========================================================

function obtenerUbicacion() {

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


    if (!navigator.geolocation) {

        mostrarEstado(
            "Tu navegador no permite obtener la ubicación.",
            true
        );

        return;

    }


    if (btn) {

        btn.disabled = true;

        btn.innerHTML = `
            <i class="material-icons left">
                location_searching
            </i>
            Obteniendo...
        `;

    }


    mostrarEstado(
        "Solicitando tu ubicación...",
        false
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitud =
                position.coords.latitude;


            const longitud =
                position.coords.longitude;


            const txtLatitud =
                document.getElementById(
                    "txtLatitud"
                );


            const txtLongitud =
                document.getElementById(
                    "txtLongitud"
                );


            if (txtLatitud) {
                txtLatitud.value =
                    latitud;
            }


            if (txtLongitud) {
                txtLongitud.value =
                    longitud;
            }


            const latitudVista =
                document.getElementById(
                    "latitudVista"
                );


            const longitudVista =
                document.getElementById(
                    "longitudVista"
                );


            if (latitudVista) {
                latitudVista.textContent =
                    latitud.toFixed(6);
            }


            if (longitudVista) {
                longitudVista.textContent =
                    longitud.toFixed(6);
            }


            if (map) {

                map.setView(
                    [
                        latitud,
                        longitud
                    ],
                    17
                );

            }


            if (marcador) {

                marcador.setLatLng([
                    latitud,
                    longitud
                ]);

                marcador.bindPopup(
                    "Tu ubicación"
                );

                marcador.openPopup();

            }


            obtenerDireccion(
                latitud,
                longitud
            );

        },

        function (error) {

            console.error(
                "Error de geolocalización:",
                error
            );


            let mensaje =
                "No se pudo obtener tu ubicación.";


            switch (error.code) {

                case error.PERMISSION_DENIED:

                    mensaje =
                        "Permiso de ubicación denegado.";

                    break;


                case error.POSITION_UNAVAILABLE:

                    mensaje =
                        "La ubicación no está disponible.";

                    break;


                case error.TIMEOUT:

                    mensaje =
                        "Se agotó el tiempo para obtener la ubicación.";

                    break;

            }


            mostrarEstado(
                mensaje,
                true
            );


            restaurarBotonUbicacion();

        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }

    );

}


// =========================================================
// OBTENER DIRECCIÓN
// =========================================================

async function obtenerDireccion(
    latitud,
    longitud
) {

    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    if (direccion) {
        direccion.value =
            "Buscando dirección...";
    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }


    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitud)}&lon=${encodeURIComponent(longitud)}&zoom=18&addressdetails=1`;


        const respuesta =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!respuesta.ok) {
            throw new Error(
                "No se pudo consultar la dirección."
            );
        }


        const datos =
            await respuesta.json();


        const address =
            datos.address || {};


        const calle =
            address.road ||
            address.pedestrian ||
            address.footway ||
            address.path ||
            "";


        const numero =
            address.house_number ||
            "";


        const colonia =
            address.suburb ||
            address.neighbourhood ||
            address.quarter ||
            "";


        const ciudad =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            "";


        const estado =
            address.state ||
            "";


        const codigoPostal =
            address.postcode ||
            "";


        let direccionFinal = "";


        if (calle) {
            direccionFinal += calle;
        }


        if (numero) {
            direccionFinal +=
                " " + numero;
        }


        if (colonia) {
            direccionFinal +=
                ", " + colonia;
        }


        if (ciudad) {
            direccionFinal +=
                ", " + ciudad;
        }


        if (estado) {
            direccionFinal +=
                ", " + estado;
        }


        if (codigoPostal) {
            direccionFinal +=
                ", C.P. " + codigoPostal;
        }


        if (!direccionFinal.trim()) {

            direccionFinal =
                datos.display_name ||
                `${latitud}, ${longitud}`;

        }


        if (direccion) {
            direccion.value =
                direccionFinal;
        }


        if (typeof M !== "undefined") {
            M.updateTextFields();
        }


        mostrarEstado(
            "✓ Ubicación encontrada correctamente.",
            false
        );


        restaurarBotonUbicacion(true);


        if (marcador) {

            marcador.bindPopup(
                `<strong>Ubicación de entrega</strong><br>${direccionFinal}`
            );

            marcador.openPopup();

        }

    }

    catch (error) {

        console.error(
            "Error obteniendo dirección:",
            error
        );


        if (direccion) {
            direccion.value =
                `${latitud}, ${longitud}`;
        }


        if (typeof M !== "undefined") {
            M.updateTextFields();
        }


        mostrarEstado(
            "Ubicación obtenida, pero no se pudo convertir en dirección.",
            true
        );


        restaurarBotonUbicacion();

    }

}


// =========================================================
// MOSTRAR ESTADO
// =========================================================

function mostrarEstado(
    mensaje,
    error
) {

    const elemento =
        document.getElementById(
            "estadoUbicacion"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        error
            ? "red-text"
            : "green-text";

}


// =========================================================
// RESTAURAR BOTÓN UBICACIÓN
// =========================================================

function restaurarBotonUbicacion(
    correcto = false
) {

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


    if (!btn) {
        return;
    }


    btn.disabled = false;


    if (correcto) {

        btn.innerHTML = `
            <i class="material-icons left">
                check
            </i>
            Ubicación obtenida
        `;

    }

    else {

        btn.innerHTML = `
            <i class="material-icons left">
                location_on
            </i>
            Obtener ubicación
        `;

    }

}


// =========================================================
// GUARDAR PEDIDO
// =========================================================

function guardarPedido() {

    const lista =
        document.getElementById(
            "listaplatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    const ingredientes =
        document.getElementById(
            "txtIngredientes"
        );


    const costo =
        document.getElementById(
            "txtCosto"
        );


    const latitud =
        document.getElementById(
            "txtLatitud"
        );


    const longitud =
        document.getElementById(
            "txtLongitud"
        );


    if (!lista || !lista.value) {

        alert(
            "Selecciona un platillo."
        );

        return;

    }


    if (
        !nombre ||
        !nombre.value.trim()
    ) {

        alert(
            "Ingresa tu nombre."
        );

        if (nombre) {
            nombre.focus();
        }

        return;

    }


    if (
        !direccion ||
        !direccion.value.trim()
    ) {

        alert(
            "Ingresa u obtén tu dirección."
        );

        if (direccion) {
            direccion.focus();
        }

        return;

    }


    const platillo =
        platillos[lista.value];


    if (!platillo) {

        alert(
            "No se encontró la información del platillo."
        );

        return;

    }


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    const pedido = {

        platilloId:
            lista.value,

        platillo:
            platillo.nombre || "",

        ingredientes:
            platillo.ingredientes || "",

        precio:
            precio,

        foto:
            platillo.foto || "",

        nombreCliente:
            nombre.value.trim(),

        direccion:
            direccion.value.trim(),

        latitud:
            latitud &&
            latitud.value
                ? parseFloat(latitud.value)
                : null,

        longitud:
            longitud &&
            longitud.value
                ? parseFloat(longitud.value)
                : null,

        fecha:
            new Date().toISOString()

    };


    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;

    }


    const btn =
        document.getElementById(
            "btnGuardar"
        );


    if (btn) {

        btn.disabled = true;

        btn.innerHTML = `
            <i class="material-icons left">
                hourglass_empty
            </i>
            Guardando...
        `;

    }


    db.collection("pedidos")
        .add(pedido)

        .then(
            function (docRef) {

                console.log(
                    "Pedido guardado:",
                    docRef.id
                );


                window.location.href =
                    "../index.html";

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error guardando pedido:",
                    error
                );


                alert(
                    "Ocurrió un error al guardar el pedido."
                );

            }
        )

        .finally(
            function () {

                if (btn) {

                    btn.disabled = false;

                    btn.innerHTML = `
                        <i class="material-icons left">
                            save
                        </i>
                        Guardar pedido
                    `;

                }

            }
        );

}


// =========================================================
// LIMPIAR PEDIDO
// =========================================================

function limpiarPedido() {

    const lista =
        document.getElementById(
            "listaplatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    const ingredientes =
        document.getElementById(
            "txtIngredientes"
        );


    const costo =
        document.getElementById(
            "txtCosto"
        );


    const latitud =
        document.getElementById(
            "txtLatitud"
        );


    const longitud =
        document.getElementById(
            "txtLongitud"
        );


    if (lista) {
        lista.value = "";
    }


    if (nombre) {
        nombre.value = "";
    }


    if (direccion) {
        direccion.value = "";
    }


    if (ingredientes) {
        ingredientes.value = "";
    }


    if (costo) {
        costo.value =
            "$0.00 MXN";
    }


    if (latitud) {
        latitud.value = "";
    }


    if (longitud) {
        longitud.value = "";
    }


    const ingredientesVista =
        document.getElementById(
            "ingredientesVista"
        );


    const costoVista =
        document.getElementById(
            "costoVista"
        );


    if (ingredientesVista) {

        ingredientesVista.textContent =
            "Selecciona un platillo";

    }


    if (costoVista) {

        costoVista.textContent =
            "$0.00 MXN";

    }


    if (typeof M !== "undefined") {
        M.updateTextFields();
    }


    mostrarEstado(
        "",
        false
    );

}


// =========================================================
// ACTUALIZAR MAPA AL CAMBIAR TAMAÑO
// =========================================================

window.addEventListener(
    "resize",
    function () {

        if (map) {

            setTimeout(
                function () {

                    map.invalidateSize();

                },
                200
            );

        }

    }
);
