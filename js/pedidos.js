// =========================================================
// VARIABLES
// =========================================================

let map = null;
let marcador = null;
let platillos = {};


// =========================================================
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const menus =
        document.querySelectorAll(".sidenav");

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
    // CAMBIO DE PLATILLO
    // =====================================================

    // IMPORTANTE:
    // En pedidos.html el ID es "listaplatillos"

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


    // Ciudad de México como posición inicial

    const posicionInicial = [
        19.4326,
        -99.1332
    ];


    map = L.map("map").setView(
        posicionInicial,
        12
    );


    // OpenStreetMap

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    // Marcador inicial

    marcador =
        L.marker(
            posicionInicial
        ).addTo(map);


    marcador.bindPopup(
        "Ubicación inicial"
    );

}


// =========================================================
// CARGAR PLATILLOS DESDE FIREBASE
// =========================================================

function cargarPlatillos() {

    if (
        typeof db === "undefined"
    ) {

        console.error(
            "Firebase no está inicializado. Verifica firebase.js"
        );

        return;
    }


    // IMPORTANTE:
    // Este es el ID que realmente tienes en pedidos.html

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

                // Limpiar

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


                        platillos[id] = datos;


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


    // =====================================================
    // MOSTRAR EN TARJETA
    // =====================================================

    if (ingredientesVista) {

        ingredientesVista.textContent =
            ingredientes;

    }


    if (costoVista) {

        costoVista.textContent =
            `$${precio.toFixed(2)} MXN`;

    }


    // =====================================================
    // MOSTRAR EN CAMPOS
    // =====================================================

    if (ingredientesInput) {

        ingredientesInput.value =
            ingredientes;

    }


    if (costoInput) {

        costoInput.value =
            `$${precio.toFixed(2)} MXN`;

    }


    // Materialize

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


    const estado =
        document.getElementById(
            "estadoUbicacion"
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


            console.log(
                "Latitud:",
                latitud
            );


            console.log(
                "Longitud:",
                longitud
            );


            // =================================================
            // GUARDAR COORDENADAS
            // =================================================

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


            // =================================================
            // MOSTRAR COORDENADAS
            // =================================================

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


            // =================================================
            // MOVER MAPA
            // =================================================

            if (map) {

                map.setView(
                    [
                        latitud,
                        longitud
                    ],
                    17
                );

            }


            // =================================================
            // MOVER MARCADOR
            // =================================================

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


            // =================================================
            // OBTENER DIRECCIÓN
            // =================================================

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
                        "Permiso de ubicación denegado. Permite el acceso a la ubicación en tu navegador.";

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
// OBTENER DIRECCIÓN A PARTIR DE COORDENADAS
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


        console.log(
            "Datos de dirección:",
            datos
        );


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


    if (error) {

        elemento.className =
            "red-text";

    }

    else {

        elemento.className =
            "green-text";

    }

}


// =========================================================
// RESTAURAR BOTÓN
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

    // IMPORTANTE:
    // El ID real del select en pedidos.html
    // es "listaplatillos"

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


    // =====================================================
    // VALIDAR PLATILLO
    // =====================================================

    if (!lista || !lista.value) {

        alert(
            "Selecciona un platillo."
        );

        return;
    }


    // =====================================================
    // VALIDAR NOMBRE
    // =====================================================

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


    // =====================================================
    // VALIDAR DIRECCIÓN
    // =====================================================

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


    // =====================================================
    // VALIDAR GPS
    // =====================================================

    if (
        !latitud ||
        !latitud.value ||
        !longitud ||
        !longitud.value
    ) {

        const confirmar =
            confirm(
                "No has obtenido tu ubicación. ¿Deseas guardar el pedido sin ubicación GPS?"
            );


        if (!confirmar) {
            return;
        }

    }


    // =====================================================
    // DATOS DEL PLATILLO
    // =====================================================

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


    // =====================================================
    // CREAR PEDIDO
    // =====================================================

    const pedido = {

        platilloId:
            lista.value,

        platillo:
            platillo.nombre || "",

        ingredientes:
            platillo.ingredientes || "",

        precio:
            precio,

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


    // =====================================================
    // FIREBASE
    // =====================================================

    if (
        typeof db === "undefined"
    ) {

        alert(
            "Firebase no está disponible."
        );

        console.error(
            "db no está definido."
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


    // =====================================================
    // GUARDAR EN FIREBASE
    // =====================================================

    db.collection("pedidos")
        .add(pedido)

        .then(
            function (docRef) {

                console.log(
                    "Pedido guardado:",
                    docRef.id
                );


                // =================================================
                // CREAR DATOS PARA INDEX
                // =================================================

                const platilloParaIndex = {

                    id:
                        "pedido_" +
                        docRef.id,

                    nombre:
                        platillo.nombre ||
                        "Sin nombre",

                    ingredientes:
                        platillo.ingredientes ||
                        "Sin ingredientes",

                    precio:
                        precio,

                    foto:
                        platillo.foto ||
                        "",

                    pedidoId:
                        docRef.id,

                    cliente:
                        nombre.value.trim(),

                    direccion:
                        direccion.value.trim()

                };


                // =================================================
                // GUARDAR TEMPORALMENTE
                // =================================================

                localStorage.setItem(
                    "nuevoPlatilloIndex",
                    JSON.stringify(
                        platilloParaIndex
                    )
                );


                // =================================================
                // REDIRIGIR AL INDEX
                // =================================================

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


    // =====================================================
    // INFORMACIÓN VISUAL
    // =====================================================

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
            "No disponible";

    }


    if (longitudVista) {

        longitudVista.textContent =
            "No disponible";

    }


    // =====================================================
    // MAPA
    // =====================================================

    if (map) {

        map.setView(
            [
                19.4326,
                -99.1332
            ],
            12
        );

    }


    if (marcador) {

        marcador.setLatLng([
            19.4326,
            -99.1332
        ]);

        marcador.bindPopup(
            "Ubicación inicial"
        );

    }


    // =====================================================
    // MATERIALIZE
    // =====================================================

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
