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
let camaraInicializada = false;

let anchoVideo = 640;
let altoVideo = 480;


// =========================================================
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const menus = document.querySelectorAll(".sidenav");

    if (typeof M !== "undefined") {

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
    // CARGAR PEDIDOS EN INDEX
    // =====================================================

    cargarPedidosEnIndex();


    // =====================================================
    // INICIALIZAR CÁMARA
    // =====================================================

    inicializarCamara();


    // =====================================================
    // CAMBIO DE PLATILLO
    // =====================================================

    const lista =
        document.getElementById(
            "listaplatillos"
        );


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
        document.getElementById(
            "btnUbicacion"
        );


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
        document.getElementById(
            "btnCancelar"
        );


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
        document.getElementById(
            "btnGuardar"
        );


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
        document.querySelector(
            ".recipes"
        );


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
                    boton.getAttribute(
                        "data-id"
                    );


                if (!id) {

                    return;

                }


                eliminarPedido(id);

            }
        );

    }

});


// =========================================================
// INICIAR MAPA
// =========================================================

function iniciarMapa() {

    const mapaElemento =
        document.getElementById(
            "map"
        );


    if (!mapaElemento) {

        return;

    }


    if (
        typeof L === "undefined"
    ) {

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
        L.map(
            "map"
        ).setView(
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

    if (
        typeof db === "undefined"
    ) {

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

    if (
        typeof db === "undefined"
    ) {

        console.error(
            "Firebase no está disponible."
        );

        return;

    }


    const contenedor =
        document.querySelector(
            ".recipes"
        );


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


                        if (
                            !tarjetaExistente
                        ) {

                            mostrarPedidoEnIndex(
                                platillo,
                                id,
                                pedido
                            );

                        }

                    }
                );


                // =================================================
                // ELIMINAR TARJETAS QUE YA NO EXISTAN
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
        document.querySelector(
            ".recipes"
        );


    if (!contenedor) {

        return;

    }


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
                    object-fit:cover;
                    border-radius:10px;
                "
                alt="${platillo.nombre}"
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


    const tarjeta =
        document.createElement(
            "div"
        );


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
                    class="
                        btn
                        red
                        waves-effect
                        waves-light
                        btn-eliminar-pedido
                    "
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


    if (
        typeof db === "undefined"
    ) {

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
            "opacity 0.15s ease, transform 0.15s ease";


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
            150
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


    if (
        typeof M !== "undefined"
    ) {

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


    if (
        typeof M !== "undefined"
    ) {

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


        if (
            typeof M !== "undefined"
        ) {

            M.updateTextFields();

        }


        mostrarEstado(
            "✓ Ubicación encontrada correctamente.",
            false
        );


        restaurarBotonUbicacion(
            true
        );


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


        if (
            typeof M !== "undefined"
        ) {

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


    if (
        typeof db === "undefined"
    ) {

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

                console.log(
                    "Pedido guardado:",
                    docRef.id
                );


                /*
                 * IMPORTANTE:
                 *
                 * pedidos.html está dentro de /pages/
                 * y index.html está en la raíz.
                 *
                 * Por eso desde pedidos.html
                 * debemos regresar una carpeta.
                 */

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


    if (
        typeof M !== "undefined"
    ) {

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


// =========================================================
// =========================================================
// CÁMARA
// =========================================================
// =========================================================


// =========================================================
// INICIALIZAR CÁMARA
// =========================================================

function inicializarCamara() {

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


    // =====================================================
    // VERIFICAR ELEMENTOS
    // =====================================================

    if (
        !btnCamara &&
        !btnCapturar &&
        !btnLimpiar &&
        !btnFoto
    ) {

        return;

    }


    // =====================================================
    // BOTÓN USAR CÁMARA
    // =====================================================

    if (btnCamara) {

        btnCamara.addEventListener(
            "click",
            function () {

                iniciarCamara();

            }
        );

    }


    // =====================================================
    // BOTÓN CAPTURAR
    // =====================================================

    if (btnCapturar) {

        btnCapturar.addEventListener(
            "click",
            function () {

                capturarFoto();

            }
        );

    }


    // =====================================================
    // BOTÓN LIMPIAR
    // =====================================================

    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            function () {

                limpiarCamara();

            }
        );

    }


    // =====================================================
    // SELECCIONAR IMAGEN
    // =====================================================

    if (btnFoto) {

        btnFoto.addEventListener(
            "change",
            function (e) {

                cargarImagenSeleccionada(
                    e
                );

            }
        );

    }


    // =====================================================
    // VIDEO
    // =====================================================

    if (video) {

        video.addEventListener(
            "loadedmetadata",
            function () {

                if (
                    video.videoWidth &&
                    video.videoHeight
                ) {

                    anchoVideo =
                        video.videoWidth;


                    altoVideo =
                        video.videoHeight;

                }

            }
        );

    }

}


// =========================================================
// INICIAR CÁMARA
// =========================================================

async function iniciarCamara() {

    const video =
        document.getElementById(
            "Video"
        );


    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    const estado =
        document.getElementById(
            "cameraStatus"
        );


    const errorElemento =
        document.getElementById(
            "cameraError"
        );


    if (!video) {

        console.error(
            "No se encontró el elemento #Video."
        );

        return;

    }


    // =====================================================
    // LIMPIAR ERROR
    // =====================================================

    if (errorElemento) {

        errorElemento.textContent =
            "";

    }


    // =====================================================
    // VERIFICAR SOPORTE
    // =====================================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        mostrarErrorCamara(
            "Tu navegador no permite utilizar la cámara desde esta página."
        );

        return;

    }


    // =====================================================
    // DETENER CÁMARA ANTERIOR
    // =====================================================

    detenerStreamCamara();


    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    let restricciones = {

        audio: false,

        video: {

            width: {
                ideal: 1280
            },

            height: {
                ideal: 720
            }

        }

    };


    /*
     * En teléfonos intentamos usar
     * la cámara trasera.
     *
     * En PC el navegador ignorará
     * esta preferencia si no aplica.
     */

    restricciones.video.facingMode = {
        ideal: "environment"
    };


    // =====================================================
    // ESTADO
    // =====================================================

    if (estado) {

        estado.textContent =
            "Solicitando acceso a la cámara...";

    }


    if (btnCamara) {

        btnCamara.disabled =
            true;

    }


    try {

        // =================================================
        // SOLICITAR CÁMARA
        // =================================================

        const stream =
            await navigator.mediaDevices.getUserMedia(
                restricciones
            );


        streamCamara =
            stream;


        camaraActiva =
            true;


        camaraInicializada =
            true;


        // =================================================
        // CONECTAR VIDEO
        // =================================================

        video.srcObject =
            stream;


        video.muted =
            true;


        video.autoplay =
            true;


        video.playsInline =
            true;


        // =================================================
        // MOSTRAR VIDEO
        // =================================================

        video.style.display =
            "block";


        // =================================================
        // REPRODUCIR
        // =================================================

        try {

            await video.play();

        }

        catch (playError) {

            console.warn(
                "No se pudo reproducir automáticamente:",
                playError
            );

        }


        // =================================================
        // ACTUALIZAR TAMAÑO
        // =================================================

        if (
            video.videoWidth &&
            video.videoHeight
        ) {

            anchoVideo =
                video.videoWidth;


            altoVideo =
                video.videoHeight;

        }


        if (estado) {

            estado.textContent =
                "✓ Cámara activa. Puedes tomar la foto.";

        }


        if (btnCamara) {

            btnCamara.disabled =
                false;


            btnCamara.innerHTML = `
                <i class="material-icons left">
                    videocam
                </i>
                Cámara activa
            `;

        }


        // =================================================
        // MOSTRAR INFORMACIÓN
        // =================================================

        console.log(
            "Cámara iniciada correctamente."
        );


        console.log(
            "Resolución:",
            video.videoWidth,
            "x",
            video.videoHeight
        );


        // =================================================
        // MOSTRAR BOTÓN CAPTURAR
        // =================================================

        const btnCapturar =
            document.getElementById(
                "btnCapturar"
            );


        if (btnCapturar) {

            btnCapturar.disabled =
                false;

        }

    }

    catch (error) {

        console.error(
            "Error al iniciar cámara:",
            error
        );


        camaraActiva =
            false;


        camaraInicializada =
            false;


        streamCamara =
            null;


        let mensaje =
            "No se pudo abrir la cámara.";


        // =================================================
        // ERRORES
        // =================================================

        if (
            error.name ===
            "NotAllowedError"
        ) {

            mensaje =
                "Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.";

        }


        else if (
            error.name ===
            "PermissionDeniedError"
        ) {

            mensaje =
                "Permiso de cámara denegado. Permite el acceso a la cámara.";

        }


        else if (
            error.name ===
            "NotFoundError"
        ) {

            mensaje =
                "No se encontró ninguna cámara disponible en este dispositivo.";

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
            "OverconstrainedError"
        ) {

            mensaje =
                "La cámara no es compatible con la configuración solicitada.";

        }


        else if (
            error.name ===
            "SecurityError"
        ) {

            mensaje =
                "El navegador bloqueó el acceso a la cámara por motivos de seguridad.";

        }


        else if (
            location.protocol !== "https:" &&
            location.hostname !== "localhost"
        ) {

            mensaje =
                "La cámara requiere HTTPS o localhost. Si estás usando el teléfono, abre la aplicación mediante HTTPS.";

        }


        mostrarErrorCamara(
            mensaje
        );


        if (btnCamara) {

            btnCamara.disabled =
                false;


            btnCamara.innerHTML = `
                <i class="material-icons left">
                    camera_alt
                </i>
                Usar cámara
            `;

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


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    const estado =
        document.getElementById(
            "cameraStatus"
        );


    if (!video) {

        mostrarErrorCamara(
            "No se encontró la cámara."
        );

        return;

    }


    if (!canvas) {

        mostrarErrorCamara(
            "No se encontró el canvas para capturar la imagen."
        );

        return;

    }


    // =====================================================
    // VERIFICAR CÁMARA ACTIVA
    // =====================================================

    if (
        !streamCamara ||
        !camaraActiva
    ) {

        mostrarErrorCamara(
            "Primero presiona «Usar cámara»."
        );

        return;

    }


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        mostrarErrorCamara(
            "La cámara todavía no está lista. Espera un momento."
        );

        return;

    }


    // =====================================================
    // TAMAÑO REAL
    // =====================================================

    const ancho =
        video.videoWidth;


    const alto =
        video.videoHeight;


    canvas.width =
        ancho;


    canvas.height =
        alto;


    // =====================================================
    // CONTEXTO
    // =====================================================

    const contexto =
        canvas.getContext(
            "2d"
        );


    if (!contexto) {

        mostrarErrorCamara(
            "No se pudo preparar la imagen."
        );

        return;

    }


    // =====================================================
    // CAPTURAR
    // =====================================================

    contexto.drawImage(
        video,
        0,
        0,
        ancho,
        alto
    );


    // =====================================================
    // CONVERTIR A IMAGEN
    // =====================================================

    const imagen =
        canvas.toDataURL(
            "image/jpeg",
            0.90
        );


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
    // GUARDAR EN INPUT OCULTO
    // =====================================================

    if (fotoInput) {

        fotoInput.value =
            imagen;

    }


    // =====================================================
    // ESTADO
    // =====================================================

    if (estado) {

        estado.textContent =
            "✓ Foto capturada correctamente.";

    }


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerStreamCamara();


    camaraActiva =
        false;


    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    if (btnCamara) {

        btnCamara.disabled =
            false;


        btnCamara.innerHTML = `
            <i class="material-icons left">
                camera_alt
            </i>
            Usar cámara
        `;

    }


    console.log(
        "Foto capturada correctamente."
    );

}


// =========================================================
// SELECCIONAR IMAGEN
// =========================================================

function cargarImagenSeleccionada(
    evento
) {

    const archivo =
        evento.target.files &&
        evento.target.files[0];


    const foto =
        document.getElementById(
            "foto"
        );


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    const estado =
        document.getElementById(
            "cameraStatus"
        );


    const errorElemento =
        document.getElementById(
            "cameraError"
        );


    if (!archivo) {

        return;

    }


    // =====================================================
    // VERIFICAR TIPO
    // =====================================================

    if (
        !archivo.type.startsWith(
            "image/"
        )
    ) {

        if (errorElemento) {

            errorElemento.textContent =
                "El archivo seleccionado no es una imagen.";

        }

        return;

    }


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerStreamCamara();


    // =====================================================
    // LEER IMAGEN
    // =====================================================

    const lector =
        new FileReader();


    lector.onload =
        function (e) {

            const resultado =
                e.target.result;


            if (foto) {

                foto.src =
                    resultado;


                foto.style.display =
                    "block";

            }


            if (fotoInput) {

                fotoInput.value =
                    resultado;

            }


            if (estado) {

                estado.textContent =
                    "✓ Imagen seleccionada correctamente.";

            }


            if (errorElemento) {

                errorElemento.textContent =
                    "";

            }

        };


    lector.onerror =
        function () {

            if (errorElemento) {

                errorElemento.textContent =
                    "No se pudo leer la imagen.";

            }

        };


    lector.readAsDataURL(
        archivo
    );

}


// =========================================================
// LIMPIAR CÁMARA
// =========================================================

function limpiarCamara() {

    const video =
        document.getElementById(
            "Video"
        );


    const foto =
        document.getElementById(
            "foto"
        );


    const canvas =
        document.getElementById(
            "Canvas"
        );


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    const btnFoto =
        document.getElementById(
            "btnFoto"
        );


    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    const estado =
        document.getElementById(
            "cameraStatus"
        );


    const errorElemento =
        document.getElementById(
            "cameraError"
        );


    // =====================================================
    // DETENER STREAM
    // =====================================================

    detenerStreamCamara();


    camaraActiva =
        false;


    camaraInicializada =
        false;


    // =====================================================
    // VIDEO
    // =====================================================

    if (video) {

        video.pause();


        video.srcObject =
            null;


        video.style.display =
            "block";

    }


    // =====================================================
    // FOTO
    // =====================================================

    if (foto) {

        foto.src =
            "";


        foto.style.display =
            "none";

    }


    // =====================================================
    // CANVAS
    // =====================================================

    if (canvas) {

        const contexto =
            canvas.getContext(
                "2d"
            );


        if (contexto) {

            contexto.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }


        canvas.width =
            0;


        canvas.height =
            0;

    }


    // =====================================================
    // INPUT FOTO
    // =====================================================

    if (fotoInput) {

        fotoInput.value =
            "";

    }


    if (btnFoto) {

        btnFoto.value =
            "";

    }


    // =====================================================
    // BOTÓN CÁMARA
    // =====================================================

    if (btnCamara) {

        btnCamara.disabled =
            false;


        btnCamara.innerHTML = `
            <i class="material-icons left">
                camera_alt
            </i>
            Usar cámara
        `;

    }


    // =====================================================
    // ESTADO
    // =====================================================

    if (estado) {

        estado.textContent =
            "Cámara lista para tomar una foto.";

    }


    if (errorElemento) {

        errorElemento.textContent =
            "";

    }

}


// =========================================================
// DETENER STREAM DE CÁMARA
// =========================================================

function detenerStreamCamara() {

    if (!streamCamara) {

        return;

    }


    try {

        streamCamara
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

    }

    catch (error) {

        console.error(
            "Error deteniendo cámara:",
            error
        );

    }


    streamCamara =
        null;


    camaraActiva =
        false;

}


// =========================================================
// MOSTRAR ERROR DE CÁMARA
// =========================================================

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


    const estado =
        document.getElementById(
            "cameraStatus"
        );


    if (estado) {

        estado.textContent =
            "No se pudo iniciar la cámara.";

    }


    console.error(
        "Cámara:",
        mensaje
    );

}


// =========================================================
// DETENER CÁMARA AL SALIR
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        detenerStreamCamara();

    }
);


// =========================================================
// EVITAR PROBLEMAS AL CAMBIAR DE PÁGINA
// =========================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.hidden
        ) {

            detenerStreamCamara();

        }

    }
);
