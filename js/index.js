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
// FOTO ACTUAL
// =========================================================

let fotoActual = "";



// =========================================================
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚ LATERAL MATERIALIZE
    // =====================================================

    const menus = document.querySelectorAll(".sidenav");

    if (
        typeof M !== "undefined" &&
        menus.length > 0
    ) {
        M.Sidenav.init(menus);
    }



    // =====================================================
    // INICIAR MAPA
    // =====================================================

    iniciarMapa();



    // =====================================================
    // CARGAR PLATILLOS
    // =====================================================

    cargarPlatillos();



    // =====================================================
    // CARGAR PLATILLOS EN INDEX
    // =====================================================

    cargarPlatillosEnIndex();



    // =====================================================
    // CARGAR PEDIDOS
    // =====================================================

    cargarPedidosEnIndex();



    // =====================================================
    // EVENTOS
    // =====================================================

    iniciarEventos();



    // =====================================================
    // CÁMARA
    // =====================================================

    iniciarControlesCamara();

});



// =========================================================
// EVENTOS
// =========================================================

function iniciarEventos() {

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
    // UBICACIÓN
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
    // ELIMINAR TARJETAS
    // =====================================================

    const contenedor =
        document.querySelector(".recipes");

    if (contenedor) {

        contenedor.addEventListener("click", function (e) {

            // =================================================
            // ELIMINAR PEDIDO
            // =================================================

            const botonPedido =
                e.target.closest(".btn-eliminar-pedido");

            if (botonPedido) {

                const id =
                    botonPedido.getAttribute("data-id");

                if (id) {

                    eliminarPedido(id);

                }

                return;

            }



            // =================================================
            // ELIMINAR PLATILLO
            // =================================================

            const botonPlatillo =
                e.target.closest(".btn-eliminar-platillo");

            if (botonPlatillo) {

                const id =
                    botonPlatillo.getAttribute("data-id");

                if (id) {

                    eliminarPlatillo(id);

                }

            }

        });

    }

}



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

    map =
        L.map("map").setView(
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

    db.collection("platillos").onSnapshot(

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

            if (typeof M !== "undefined") {

                const instancia =
                    M.FormSelect.getInstance(
                        select
                    );

                if (instancia) {

                    instancia.destroy();

                }

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
// CARGAR PLATILLOS EN EL INDEX
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

    db.collection("platillos").onSnapshot(

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

                    const tarjeta =
                        document.getElementById(
                            "platillo_" + id
                        );

                    if (!tarjeta) {

                        mostrarPlatilloEnIndex(
                            platillo,
                            id
                        );

                    }

                    else {

                        tarjeta.innerHTML =
                            crearHTMLPlatillo(
                                platillo,
                                id
                            );

                    }

                }
            );



            // =================================================
            // ELIMINAR DEL HTML LOS QUE YA NO EXISTEN
            // =================================================

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
// MOSTRAR PLATILLO EN INDEX
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
        crearHTMLPlatillo(
            platillo,
            id
        );

    contenedor.appendChild(
        tarjeta
    );

}



// =========================================================
// CREAR HTML DEL PLATILLO
// =========================================================

function crearHTMLPlatillo(
    platillo,
    id
) {

    let imagenHTML = "";

    if (
        platillo.foto &&
        typeof platillo.foto === "string" &&
        platillo.foto.trim() !== ""
    ) {

        imagenHTML = `
            <img
                src="${escapeHTML(platillo.foto)}"
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
                    ${escapeHTML(
                        platillo.nombre
                    )}
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

                    ${escapeHTML(
                        platillo.ingredientes
                    )}

                </div>

                <div
                    class="recipe-price"
                    style="
                        font-weight:bold;
                        margin-bottom:12px;
                    "
                >

                    $${precio.toFixed(2)} MXN

                </div>

                <button
                    type="button"
                    class="
                        btn
                        red
                        waves-effect
                        waves-light
                        btn-eliminar-platillo
                    "
                    data-id="${escapeHTML(id)}"
                >

                    <i class="material-icons left">
                        delete
                    </i>

                    Eliminar

                </button>

            </div>

        </div>

    `;

}



// =========================================================
// ELIMINAR PLATILLO
// =========================================================

function eliminarPlatillo(id) {

    if (!id) {

        return;

    }

    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;

    }

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este platillo?"
        );

    if (!confirmar) {

        return;

    }

    const tarjeta =
        document.getElementById(
            "platillo_" + id
        );

    if (tarjeta) {

        tarjeta.style.transition =
            "opacity .2s ease, transform .2s ease";

        tarjeta.style.opacity =
            "0";

        tarjeta.style.transform =
            "scale(.95)";

    }

    db.collection("platillos")
        .doc(id)
        .delete()

        .then(
            function () {

                if (tarjeta) {

                    tarjeta.remove();

                }

                if (typeof M !== "undefined") {

                    M.toast({
                        html:
                            "Platillo eliminado correctamente."
                    });

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error eliminando platillo:",
                    error
                );

                if (tarjeta) {

                    tarjeta.style.opacity =
                        "1";

                    tarjeta.style.transform =
                        "scale(1)";

                }

                alert(
                    "No se pudo eliminar el platillo."
                );

            }
        );

}

window.eliminarPlatillo =
    eliminarPlatillo;



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

    db.collection("pedidos").onSnapshot(

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

                    const tarjeta =
                        document.getElementById(
                            "pedido_" + id
                        );

                    if (!tarjeta) {

                        mostrarPedidoEnIndex(
                            platillo,
                            id,
                            pedido
                        );

                    }

                    else {

                        tarjeta.innerHTML =
                            crearHTMLPedido(
                                platillo,
                                id,
                                pedido
                            );

                    }

                }
            );



            // =================================================
            // ELIMINAR PEDIDOS QUE YA NO EXISTEN
            // =================================================

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
// MOSTRAR PEDIDO
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
            id,
            pedido
        );

    contenedor.appendChild(
        tarjeta
    );

}



// =========================================================
// CREAR HTML PEDIDO
// =========================================================

function crearHTMLPedido(
    platillo,
    id,
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
                src="${escapeHTML(platillo.foto)}"
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

                    ${escapeHTML(
                        platillo.nombre
                    )}

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

                    ${escapeHTML(
                        platillo.ingredientes
                    )}

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

                            ${escapeHTML(
                                cliente
                            )}

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

                            ${escapeHTML(
                                direccion
                            )}

                        </div>
                    `
                    : ""
                }

                <div
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
                        data-id="${escapeHTML(id)}"
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

    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
        );

        return;

    }

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este pedido?"
        );

    if (!confirmar) {

        return;

    }

    const tarjeta =
        document.getElementById(
            "pedido_" + id
        );

    db.collection("pedidos")
        .doc(id)
        .delete()

        .then(
            function () {

                if (tarjeta) {

                    tarjeta.remove();

                }

                if (typeof M !== "undefined") {

                    M.toast({
                        html:
                            "Pedido eliminado correctamente."
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

window.eliminarPedido =
    eliminarPedido;



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

    if (
        !id ||
        !platillos[id]
    ) {

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

        btn.disabled =
            true;

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
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                latitud
            )}&lon=${encodeURIComponent(
                longitud
            )}&zoom=18&addressdetails=1`;

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

        let direccionFinal =
            "";

        if (calle) {

            direccionFinal +=
                calle;

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
                `<strong>Ubicación de entrega</strong><br>${escapeHTML(
                    direccionFinal
                )}`
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

    btn.disabled =
        false;

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

    const latitud =
        document.getElementById(
            "txtLatitud"
        );

    const longitud =
        document.getElementById(
            "txtLongitud"
        );

    if (
        !lista ||
        !lista.value
    ) {

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
        platillos[
            lista.value
        ];

    if (!platillo) {

        alert(
            "No se encontró la información del platillo."
        );

        return;

    }

    if (typeof db === "undefined") {

        alert(
            "Firebase no está disponible."
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
                ? parseFloat(
                    latitud.value
                )
                : null,

        longitud:
            longitud &&
            longitud.value
                ? parseFloat(
                    longitud.value
                )
                : null,

        fecha:
            new Date().toISOString()

    };

    const btn =
        document.getElementById(
            "btnGuardar"
        );

    if (btn) {

        btn.disabled =
            true;

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

                return db.collection("pedidos")
                    .doc(docRef.id)
                    .update({
                        id:
                            docRef.id
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

                    btn.disabled =
                        false;

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

        lista.value =
            "";

    }

    if (nombre) {

        nombre.value =
            "";

    }

    if (direccion) {

        direccion.value =
            "";

    }

    if (ingredientes) {

        ingredientes.value =
            "";

    }

    if (costo) {

        costo.value =
            "$0.00 MXN";

    }

    if (latitud) {

        latitud.value =
            "";

    }

    if (longitud) {

        longitud.value =
            "";

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

        if (lista) {

            const instancia =
                M.FormSelect.getInstance(
                    lista
                );

            if (instancia) {

                instancia.destroy();

            }

            M.FormSelect.init(
                lista
            );

        }

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

    if (
        !btnCamara ||
        !btnCapturar ||
        !btnLimpiar ||
        !video ||
        !canvas
    ) {

        return;

    }



    // =====================================================
    // SELECCIONAR FOTO
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

                    mostrarErrorCamara(
                        "Selecciona una imagen válida."
                    );

                    return;

                }

                mostrarEstadoCamara(
                    "Comprimiendo imagen..."
                );

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

                                fotoActual =
                                    resultado;

                                mostrarFoto(
                                    resultado
                                );

                                mostrarEstadoCamara(
                                    "✓ Imagen comprimida y lista."
                                );

                            };

                        imagen.onerror =
                            function () {

                                mostrarErrorCamara(
                                    "No se pudo cargar la imagen."
                                );

                            };

                        imagen.src =
                            e.target.result;

                    };

                lector.onerror =
                    function () {

                        mostrarErrorCamara(
                            "No se pudo leer la imagen."
                        );

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
        abrirCamara
    );



    // =====================================================
    // CAPTURAR
    // =====================================================

    btnCapturar.addEventListener(
        "click",
        capturarFoto
    );



    // =====================================================
    // LIMPIAR
    // =====================================================

    btnLimpiar.addEventListener(
        "click",
        limpiarFoto
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

    if (!video) {

        return;

    }

    const error =
        document.getElementById(
            "cameraError"
        );

    if (error) {

        error.textContent =
            "";

    }

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        mostrarErrorCamara(
            "Tu navegador no permite usar la cámara."
        );

        return;

    }

    detenerCamara();

    mostrarEstadoCamara(
        "Solicitando permiso para usar la cámara..."
    );

    try {

        streamCamara =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal:
                            "environment"
                    },

                    // =================================================
                    // RESOLUCIÓN REDUCIDA PARA MAYOR VELOCIDAD
                    // =================================================

                    width: {
                        ideal:
                            640
                    },

                    height: {
                        ideal:
                            480
                    }

                },

                audio:
                    false

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

        mostrarEstadoCamara(
            "✓ Cámara activa. Puedes tomar la foto."
        );

        video.style.display =
            "block";

    }

    catch (errorCamara) {

        console.error(
            "Error al abrir cámara:",
            errorCamara
        );

        camaraActiva =
            false;

        let mensaje =
            "No se pudo abrir la cámara.";

        if (
            errorCamara.name ===
            "NotAllowedError"
        ) {

            mensaje =
                "Permiso de cámara denegado.";

        }

        else if (
            errorCamara.name ===
            "NotFoundError"
        ) {

            mensaje =
                "No se encontró ninguna cámara.";

        }

        else if (
            errorCamara.name ===
            "NotReadableError"
        ) {

            mensaje =
                "La cámara está siendo utilizada por otra aplicación.";

        }

        else if (
            errorCamara.name ===
            "SecurityError"
        ) {

            mensaje =
                "El navegador bloqueó la cámara. Usa HTTPS o localhost.";

        }

        mostrarErrorCamara(
            mensaje
        );

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

        mostrarErrorCamara(
            "Primero activa la cámara."
        );

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

        mostrarErrorCamara(
            "La cámara todavía no está lista."
        );

        return;

    }



    // =====================================================
    // REDUCIR FOTO
    // =====================================================

    const maxWidth =
        500;

    let nuevoAncho =
        ancho;

    let nuevoAlto =
        alto;

    if (
        nuevoAncho >
        maxWidth
    ) {

        nuevoAlto =
            nuevoAlto *
            (
                maxWidth /
                nuevoAncho
            );

        nuevoAncho =
            maxWidth;

    }

    canvas.width =
        Math.round(nuevoAncho);

    canvas.height =
        Math.round(nuevoAlto);

    const contexto =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );

    contexto.imageSmoothingEnabled =
        true;

    contexto.imageSmoothingQuality =
        "medium";

    contexto.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );



    // =====================================================
    // JPEG COMPRIMIDO
    // =====================================================

    const imagen =
        canvas.toDataURL(
            "image/jpeg",
            0.40
        );

    fotoActual =
        imagen;

    mostrarFoto(
        imagen
    );

    mostrarEstadoCamara(
        "✓ Foto capturada y comprimida."
    );

    const error =
        document.getElementById(
            "cameraError"
        );

    if (error) {

        error.textContent =
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

    // =====================================================
    // ANCHO MÁXIMO
    // =====================================================

    const maxWidth =
        500;

    let ancho =
        imagen.width;

    let alto =
        imagen.height;

    if (
        ancho >
        maxWidth
    ) {

        alto =
            alto *
            (
                maxWidth /
                ancho
            );

        ancho =
            maxWidth;

    }

    canvas.width =
        Math.round(ancho);

    canvas.height =
        Math.round(alto);

    const contexto =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );

    contexto.imageSmoothingEnabled =
        true;

    contexto.imageSmoothingQuality =
        "medium";

    contexto.drawImage(
        imagen,
        0,
        0,
        canvas.width,
        canvas.height
    );



    // =====================================================
    // CALIDAD JPEG
    // =====================================================

    return canvas.toDataURL(
        "image/jpeg",
        0.40
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

    const fotoInput =
        document.getElementById(
            "fotoInput"
        );

    if (foto) {

        foto.src =
            imagen;

        foto.style.display =
            "block";

    }

    if (fotoInput) {

        fotoInput.value =
            imagen;

    }

}



// =========================================================
// LIMPIAR FOTO
// =========================================================

function limpiarFoto() {

    fotoActual =
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

    mostrarEstadoCamara(
        "Cámara lista para tomar una foto."
    );

    const error =
        document.getElementById(
            "cameraError"
        );

    if (error) {

        error.textContent =
            "";

    }

}



// =========================================================
// MENSAJES CÁMARA
// =========================================================

function mostrarEstadoCamara(
    mensaje
) {

    const elemento =
        document.getElementById(
            "cameraStatus"
        );

    if (elemento) {

        elemento.textContent =
            mensaje;

    }

}



function mostrarErrorCamara(
    mensaje
) {

    const elemento =
        document.getElementById(
            "cameraError"
        );

    if (elemento) {

        elemento.textContent =
            mensaje;

    }

    const status =
        document.getElementById(
            "cameraStatus"
        );

    if (status) {

        status.textContent =
            "Cámara no disponible.";

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
// ESCAPAR HTML
// =========================================================

function escapeHTML(
    texto
) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }

    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

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
