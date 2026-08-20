// =========================================================
// DITS - INDEX.JS
// =========================================================


// =========================================================
// VARIABLES GLOBALES
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
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("DITS - index.js iniciado");


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
    // CARGAR PLATILLOS
    // =====================================================

    cargarPlatillos();


    // =====================================================
    // CARGAR PEDIDOS
    // =====================================================

    cargarPedidosEnIndex();


    // =====================================================
    // SELECT DE PLATILLOS
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
    // BOTÓN CANCELAR
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
    // BOTÓN GUARDAR PEDIDO
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


    // =====================================================
    // INICIAR CÁMARA
    // =====================================================

    configurarCamara();

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


    // Si estamos en index.html pero no existe
    // el formulario de pedidos, no hacemos nada.

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
                // BORRAR TARJETAS QUE YA NO EXISTAN EN FIRESTORE
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
// MOSTRAR PEDIDO
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
                alt="${platillo.nombre}"
                width="100"
                height="100"
                style="
                    object-fit:cover;
                    border-radius:10px;
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
    // CREAR TARJETA
    // =====================================================

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

                        <strong>
                            Cliente:
                        </strong>

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

                        <strong>
                            Entrega:
                        </strong>

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

                marcador.setLatLng(
                    [
                        latitud,
                        longitud
                    ]
                );


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


        let direccionFinal = "";


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


                /*
                 * IMPORTANTE:
                 *
                 * pedidos.html está dentro de /pages/
                 * mientras index.html está en la raíz.
                 *
                 * Por eso NO usamos ../index.html
                 * aquí, porque este archivo index.js
                 * puede ejecutarse también desde index.html.
                 *
                 * El pedido ya se guarda en Firestore
                 * y index.html lo recibe mediante onSnapshot.
                 */


                // Volver a la página principal
                window.location.href =
                    "index.html";

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
// CONFIGURAR CÁMARA
// =========================================================

function configurarCamara() {

    console.log(
        "Configurando cámara..."
    );


    // =====================================================
    // ELEMENTOS DEL HTML
    // =====================================================

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


    // =====================================================
    // VERIFICAR ELEMENTOS
    // =====================================================

    if (!btnCamara) {

        console.log(
            "No existe btnCamara en esta página."
        );

        return;

    }


    if (!video) {

        console.error(
            "No existe el elemento #Video."
        );

        return;

    }


    if (!canvas) {

        console.error(
            "No existe el elemento #Canvas."
        );

        return;

    }


    console.log(
        "Elementos de cámara encontrados correctamente."
    );


    // =====================================================
    // BOTÓN USAR CÁMARA
    // =====================================================

    btnCamara.addEventListener(
        "click",
        async function () {

            console.log(
                "Botón Usar cámara presionado."
            );


            // Limpiar mensajes

            if (cameraError) {

                cameraError.textContent =
                    "";

            }


            if (cameraStatus) {

                cameraStatus.textContent =
                    "Solicitando acceso a la cámara...";

            }


            // =================================================
            // VERIFICAR SOPORTE
            // =================================================

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                if (cameraError) {

                    cameraError.textContent =
                        "Tu navegador no permite usar la cámara.";

                }


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara no disponible.";

                }


                return;

            }


            // =================================================
            // VERIFICAR HTTPS
            // =================================================

            const esLocalhost =
                location.hostname === "localhost" ||
                location.hostname === "127.0.0.1";


            const esSeguro =
                window.isSecureContext;


            if (
                !esSeguro &&
                !esLocalhost
            ) {

                if (cameraError) {

                    cameraError.textContent =
                        "La cámara requiere HTTPS o localhost.";

                }


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Conexión no segura.";

                }


                return;

            }


            // =================================================
            // DETENER CÁMARA ANTERIOR
            // =================================================

            detenerCamara();


            // =================================================
            // SOLICITAR CÁMARA TRASERA
            // =================================================

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
                            },

                            aspectRatio: {
                                ideal: 4 / 3
                            }

                        },

                        audio: false

                    });


                console.log(
                    "Cámara obtenida correctamente."
                );


                // =================================================
                // CONECTAR STREAM AL VIDEO
                // =================================================

                video.srcObject =
                    streamCamara;


                video.autoplay =
                    true;


                video.playsInline =
                    true;


                video.muted =
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

                    console.error(
                        "Error reproduciendo video:",
                        playError
                    );

                }


                camaraActiva =
                    true;


                // =================================================
                // ESTADO
                // =================================================

                if (cameraStatus) {

                    cameraStatus.textContent =
                        "✓ Cámara activa. Coloca el platillo frente a la cámara.";

                }


                if (cameraError) {

                    cameraError.textContent =
                        "";

                }


                // =================================================
                // BOTÓN
                // =================================================

                btnCamara.innerHTML = `
                    <i class="material-icons left">
                        videocam
                    </i>
                    Cámara activa
                `;


                btnCamara.classList.remove(
                    "green"
                );


                btnCamara.classList.add(
                    "orange"
                );

            }

            catch (error) {

                console.error(
                    "Error al abrir la cámara:",
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
                        "Permiso de cámara denegado. Permite el acceso a la cámara en el navegador.";

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
                    "OverconstrainedError"
                ) {

                    mensaje =
                        "La configuración solicitada no es compatible con la cámara.";

                }

                else if (
                    error.name ===
                    "SecurityError"
                ) {

                    mensaje =
                        "El navegador bloqueó el acceso a la cámara.";

                }


                if (cameraError) {

                    cameraError.textContent =
                        mensaje;

                }


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "No se pudo iniciar la cámara.";

                }


                btnCamara.innerHTML = `
                    <i class="material-icons left">
                        camera_alt
                    </i>
                    Usar cámara
                `;


                btnCamara.classList.remove(
                    "orange"
                );


                btnCamara.classList.add(
                    "green"
                );

            }

        }
    );


    // =====================================================
    // BOTÓN CAPTURAR
    // =====================================================

    if (btnCapturar) {

        btnCapturar.addEventListener(
            "click",
            function () {

                console.log(
                    "Botón Capturar presionado."
                );


                if (
                    !streamCamara ||
                    !camaraActiva
                ) {

                    if (cameraError) {

                        cameraError.textContent =
                            "Primero presiona 'Usar cámara'.";

                    }


                    return;

                }


                if (
                    video.readyState <
                    2
                ) {

                    if (cameraError) {

                        cameraError.textContent =
                            "La cámara todavía no está lista.";

                    }


                    return;

                }


                // =================================================
                // TAMAÑO REAL DEL VIDEO
                // =================================================

                const videoWidth =
                    video.videoWidth;


                const videoHeight =
                    video.videoHeight;


                if (
                    !videoWidth ||
                    !videoHeight
                ) {

                    if (cameraError) {

                        cameraError.textContent =
                            "No se pudo obtener la imagen de la cámara.";

                    }


                    return;

                }


                canvas.width =
                    videoWidth;


                canvas.height =
                    videoHeight;


                // =================================================
                // CONTEXTO
                // =================================================

                const contexto =
                    canvas.getContext(
                        "2d"
                    );


                if (!contexto) {

                    return;

                }


                // =================================================
                // DIBUJAR IMAGEN
                // =================================================

                contexto.drawImage(
                    video,
                    0,
                    0,
                    videoWidth,
                    videoHeight
                );


                // =================================================
                // CONVERTIR A BASE64
                // =================================================

                const imagen =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.85
                    );


                // =================================================
                // MOSTRAR FOTO
                // =================================================

                if (foto) {

                    foto.src =
                        imagen;


                    foto.style.display =
                        "block";

                }


                // =================================================
                // GUARDAR FOTO
                // =================================================

                if (fotoInput) {

                    fotoInput.value =
                        imagen;

                }


                // =================================================
                // ESTADO
                // =================================================

                if (cameraStatus) {

                    cameraStatus.textContent =
                        "✓ Foto capturada correctamente.";

                }


                if (cameraError) {

                    cameraError.textContent =
                        "";

                }


                // =================================================
                // DETENER CÁMARA
                // =================================================

                detenerCamara();


                btnCamara.innerHTML = `
                    <i class="material-icons left">
                        camera_alt
                    </i>
                    Usar cámara
                `;


                btnCamara.classList.remove(
                    "orange"
                );


                btnCamara.classList.add(
                    "green"
                );

            }
        );

    }


    // =====================================================
    // SELECCIONAR IMAGEN DEL TELÉFONO/PC
    // =====================================================

    if (btnFoto) {

        btnFoto.addEventListener(
            "change",
            function () {

                const archivo =
                    this.files &&
                    this.files[0];


                if (!archivo) {
                    return;
                }


                // =================================================
                // VERIFICAR IMAGEN
                // =================================================

                if (
                    !archivo.type.startsWith(
                        "image/"
                    )
                ) {

                    if (cameraError) {

                        cameraError.textContent =
                            "El archivo seleccionado no es una imagen.";

                    }


                    return;

                }


                const lector =
                    new FileReader();


                lector.onload =
                    function (evento) {

                        const imagen =
                            evento.target.result;


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


                        if (cameraStatus) {

                            cameraStatus.textContent =
                                "✓ Imagen seleccionada correctamente.";

                        }


                        if (cameraError) {

                            cameraError.textContent =
                                "";

                        }

                    };


                lector.onerror =
                    function () {

                        if (cameraError) {

                            cameraError.textContent =
                                "No se pudo cargar la imagen.";

                        }

                    };


                lector.readAsDataURL(
                    archivo
                );

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

                console.log(
                    "Limpiando cámara..."
                );


                // Detener cámara

                detenerCamara();


                // Limpiar video

                if (video) {

                    video.srcObject =
                        null;

                    video.style.display =
                        "block";

                }


                // Limpiar canvas

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


                // Limpiar imagen

                if (foto) {

                    foto.src =
                        "";

                    foto.style.display =
                        "none";

                }


                // Limpiar input oculto

                if (fotoInput) {

                    fotoInput.value =
                        "";

                }


                // Limpiar input de archivo

                if (btnFoto) {

                    btnFoto.value =
                        "";

                }


                // Estado

                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara lista para tomar una foto.";

                }


                if (cameraError) {

                    cameraError.textContent =
                        "";

                }


                // Restaurar botón

                btnCamara.innerHTML = `
                    <i class="material-icons left">
                        camera_alt
                    </i>
                    Usar cámara
                `;


                btnCamara.classList.remove(
                    "orange"
                );


                btnCamara.classList.add(
                    "green"
                );

            }
        );

    }

}


// =========================================================
// DETENER CÁMARA
// =========================================================

function detenerCamara() {

    if (streamCamara) {

        const pistas =
            streamCamara.getTracks();


        pistas.forEach(
            function (pista) {

                pista.stop();

            }
        );


        streamCamara =
            null;

    }


    camaraActiva =
        false;


    console.log(
        "Cámara detenida."
    );

}


// =========================================================
// DETENER CÁMARA AL SALIR DE LA PÁGINA
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
