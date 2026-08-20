// =========================================================
// DITS - PEDIDOS.JS
// Gestión de pedidos, Firebase, ubicación, mapa y QR
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

let contenidoLista = "";

let mapa = null;

let marcador = null;


// =========================================================
// INICIALIZAR PÁGINA
// =========================================================

document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const menus =
        document.querySelectorAll(".side-menu");


    if (typeof M !== "undefined") {

        M.Sidenav.init(
            menus,
            {
                edge: "right"
            }
        );

    }


    // =====================================================
    // INICIALIZAR LISTA DE PLATILLOS
    // =====================================================

    cargarPlatillos();


    // =====================================================
    // BOTÓN GUARDAR
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
    // BOTÓN CANCELAR
    // =====================================================

    const btnCancelar =
        document.getElementById("btnCancelar");


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            cancelarPedido
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

});


// =========================================================
// CARGAR PLATILLOS DESDE FIREBASE
// =========================================================

function cargarPlatillos() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase / db no está disponible."
        );

        return;

    }


    db.collection("platillos")
        .onSnapshot(
            function (coleccion) {

                coleccion.docChanges()
                    .forEach(
                        function (registro) {

                            if (
                                registro.type === "added"
                            ) {

                                agregarALista(
                                    registro.doc.data(),
                                    registro.doc.id
                                );

                            }

                        }
                    );

            },
            function (error) {

                console.error(
                    "Error al cargar platillos:",
                    error
                );

            }
        );

}


// =========================================================
// AGREGAR PLATILLO A LA LISTA
// =========================================================

function agregarALista(
    platillo,
    id
) {

    const lista =
        document.getElementById(
            "listaPlatillos"
        );


    if (!lista) {

        console.error(
            "No se encontró #listaPlatillos."
        );

        return;

    }


    // =====================================================
    // EVITAR DUPLICADOS
    // =====================================================

    const existe =
        lista.querySelector(
            `option[value="${id}"]`
        );


    if (existe) {

        return;

    }


    // =====================================================
    // CREAR OPCIÓN
    // =====================================================

    const opcion =
        document.createElement("option");


    opcion.value =
        id;


    opcion.textContent =
        platillo.nombre || "Platillo";


    lista.appendChild(
        opcion
    );

}


// =========================================================
// GUARDAR PEDIDO
// =========================================================

function guardarPedido() {


    // =====================================================
    // OBTENER ELEMENTOS
    // =====================================================

    const lista =
        document.getElementById(
            "listaPlatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    // =====================================================
    // COMPROBAR ELEMENTOS
    // =====================================================

    if (
        !lista ||
        !nombre ||
        !direccion
    ) {

        console.error(
            "No se encontraron los elementos del formulario."
        );

        return;

    }


    // =====================================================
    // OBTENER DATOS
    // =====================================================

    const opcionSeleccionada =
        lista.options[
            lista.selectedIndex
        ];


    const platillo =
        opcionSeleccionada
            ? opcionSeleccionada.text
            : "";


    const nombreValor =
        nombre.value.trim();


    const direccionValor =
        direccion.value.trim();


    // =====================================================
    // VALIDAR
    // =====================================================

    if (
        !lista.value ||
        !nombreValor ||
        !direccionValor
    ) {

        mostrarMensaje(
            "Por favor completa todos los campos.",
            "error"
        );

        return;

    }


    // =====================================================
    // COMPROBAR FIREBASE
    // =====================================================

    if (typeof db === "undefined") {

        console.error(
            "Firebase no está disponible."
        );

        mostrarMensaje(
            "No se pudo conectar con la base de datos.",
            "error"
        );

        return;

    }


    // =====================================================
    // DESACTIVAR BOTÓN
    // =====================================================

    const btnGuardar =
        document.getElementById(
            "btnGuardar"
        );


    if (btnGuardar) {

        btnGuardar.disabled =
            true;

        btnGuardar.innerHTML = `
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
        .add({

            direccion:
                direccionValor,

            nombre:
                nombreValor,

            platillo:
                platillo,

            fecha:
                new Date()

        })
        .then(
            function (docRef) {

                console.log(
                    "Pedido registrado:",
                    docRef.id
                );


                // =========================================
                // GENERAR QR
                // =========================================

                generarQR(
                    docRef.id,
                    platillo
                );


                // =========================================
                // MOSTRAR MENSAJE
                // =========================================

                mostrarMensaje(
                    "Pedido registrado correctamente.",
                    "success"
                );


                // =========================================
                // LIMPIAR FORMULARIO
                // =========================================

                limpiarFormulario();

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Error al guardar el pedido:",
                    error
                );


                mostrarMensaje(
                    "Ocurrió un error al guardar el pedido.",
                    "error"
                );

            }
        )
        .finally(
            function () {

                restaurarBotonGuardar();

            }
        );

}


// =========================================================
// GENERAR CÓDIGO QR
// =========================================================

function generarQR(
    idPedido,
    platillo
) {

    const contenedor =
        document.getElementById(
            "qr"
        );


    if (!contenedor) {

        return;

    }


    // =====================================================
    // LIMPIAR QR ANTERIOR
    // =====================================================

    contenedor.innerHTML = "";


    // =====================================================
    // COMPROBAR LIBRERÍA
    // =====================================================

    if (
        typeof QRCode === "undefined"
    ) {

        console.error(
            "QRCode no está disponible."
        );

        return;

    }


    // =====================================================
    // INFORMACIÓN DEL QR
    // =====================================================

    const informacion =
        JSON.stringify({

            id:
                idPedido,

            platillo:
                platillo,

            sistema:
                "DITS"

        });


    // =====================================================
    // GENERAR QR
    // =====================================================

    new QRCode(
        contenedor,
        {

            text:
                informacion,

            width:
                180,

            height:
                180,

            colorDark:
                "#000000",

            colorLight:
                "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        }
    );

}


// =========================================================
// CANCELAR PEDIDO
// =========================================================

function cancelarPedido() {

    limpiarFormulario();

}


// =========================================================
// LIMPIAR FORMULARIO
// =========================================================

function limpiarFormulario() {

    const lista =
        document.getElementById(
            "listaPlatillos"
        );


    const nombre =
        document.getElementById(
            "txtNombre"
        );


    const direccion =
        document.getElementById(
            "txtDireccion"
        );


    // =====================================================
    // LIMPIAR SELECT
    // =====================================================

    if (lista) {

        lista.selectedIndex =
            0;

    }


    // =====================================================
    // LIMPIAR NOMBRE
    // =====================================================

    if (nombre) {

        nombre.value =
            "";

    }


    // =====================================================
    // LIMPIAR DIRECCIÓN
    // =====================================================

    if (direccion) {

        direccion.value =
            "";

    }


    // =====================================================
    // LIMPIAR MAPA
    // =====================================================

    if (mapa) {

        mapa.remove();

        mapa = null;

        marcador = null;

    }


    // =====================================================
    // LIMPIAR CONTENEDOR QR
    // =====================================================

    const qr =
        document.getElementById(
            "qr"
        );


    if (qr) {

        qr.innerHTML =
            "";

    }

}


// =========================================================
// OBTENER UBICACIÓN
// =========================================================

function obtenerUbicacion() {


    // =====================================================
    // COMPROBAR SOPORTE
    // =====================================================

    if (
        !navigator.geolocation
    ) {

        mostrarMensaje(
            "Este navegador no soporta geolocalización.",
            "error"
        );

        return;

    }


    // =====================================================
    // MENSAJE
    // =====================================================

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


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


    // =====================================================
    // SOLICITAR UBICACIÓN
    // =====================================================

    navigator.geolocation.getCurrentPosition(

        ubicacionExitosa,

        ubicacionError,

        {

            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                0

        }

    );

}


// =========================================================
// UBICACIÓN EXITOSA
// =========================================================

function ubicacionExitosa(
    posicion
) {

    const latitud =
        posicion.coords.latitude;


    const longitud =
        posicion.coords.longitude;


    console.log(
        "Latitud:",
        latitud
    );


    console.log(
        "Longitud:",
        longitud
    );


    // =====================================================
    // MOSTRAR MAPA
    // =====================================================

    mostrarMapa(
        latitud,
        longitud
    );


    // =====================================================
    // OBTENER DIRECCIÓN
    // =====================================================

    obtenerDireccion(
        latitud,
        longitud
    );


    restaurarBotonUbicacion();

}


// =========================================================
// OBTENER DIRECCIÓN MEDIANTE NOMINATIM
// =========================================================

function obtenerDireccion(
    latitud,
    longitud
) {

    const url =
        `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json&addressdetails=1`;


    fetch(
        url,
        {

            headers: {

                "Accept":
                    "application/json",

                "User-Agent":
                    "DITS-App"

            }

        }
    )
    .then(
        function (respuesta) {

            if (!respuesta.ok) {

                throw new Error(
                    "No se pudo obtener la dirección."
                );

            }

            return respuesta.json();

        }
    )
    .then(
        function (data) {

            const direccion =
                document.getElementById(
                    "txtDireccion"
                );


            if (!direccion) {

                return;

            }


            // =================================================
            // OBTENER DIRECCIÓN COMPLETA
            // =================================================

            if (data.display_name) {

                direccion.value =
                    data.display_name;

            }
            else {

                const ciudad =
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    "";


                const pais =
                    data.address?.country ||
                    "";


                direccion.value =
                    `${ciudad}, ${pais}`;

            }


            // =================================================
            // ACTUALIZAR LABEL MATERIALIZE
            // =================================================

            if (typeof M !== "undefined") {

                M.updateTextFields();

            }

        }
    )
    .catch(
        function (error) {

            console.error(
                "Error al obtener dirección:",
                error
            );


            mostrarMensaje(
                "Se obtuvo la ubicación, pero no fue posible obtener la dirección.",
                "error"
            );

        }
    );

}


// =========================================================
// MOSTRAR MAPA
// =========================================================

function mostrarMapa(
    latitud,
    longitud
) {


    // =====================================================
    // COMPROBAR LEAFLET
    // =====================================================

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet no está disponible."
        );

        return;

    }


    // =====================================================
    // CONTENEDOR
    // =====================================================

    const contenedor =
        document.getElementById(
            "map"
        );


    if (!contenedor) {

        console.error(
            "No se encontró #map."
        );

        return;

    }


    // =====================================================
    // ELIMINAR MAPA ANTERIOR
    // =====================================================

    if (mapa) {

        mapa.remove();

        mapa = null;

        marcador = null;

    }


    // =====================================================
    // CREAR MAPA
    // =====================================================

    mapa =
        L.map(
            "map"
        ).setView(
            [
                latitud,
                longitud
            ],
            16
        );


    // =====================================================
    // CAPA DE OPENSTREETMAP
    // =====================================================

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom:
                19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

        }
    )
    .addTo(
        mapa
    );


    // =====================================================
    // MARCADOR
    // =====================================================

    marcador =
        L.marker(
            [
                latitud,
                longitud
            ]
        )
        .addTo(
            mapa
        );


    marcador.bindPopup(
        "<b>Ubicación de entrega</b>"
    )
    .openPopup();


    // =====================================================
    // FORZAR ACTUALIZACIÓN DEL MAPA
    // =====================================================

    setTimeout(
        function () {

            mapa.invalidateSize();

        },
        300
    );

}


// =========================================================
// ERROR DE GEOLOCALIZACIÓN
// =========================================================

function ubicacionError(
    error
) {

    console.error(
        "Error de geolocalización:",
        error
    );


    let mensaje =
        "No se pudo obtener la ubicación.";


    switch (
        error.code
    ) {

        case 1:

            mensaje =
                "Permiso de ubicación rechazado. Permite la ubicación en tu navegador.";

            break;


        case 2:

            mensaje =
                "No fue posible determinar tu ubicación.";

            break;


        case 3:

            mensaje =
                "La solicitud de ubicación tardó demasiado.";

            break;

    }


    mostrarMensaje(
        mensaje,
        "error"
    );


    restaurarBotonUbicacion();

}


// =========================================================
// RESTAURAR BOTÓN UBICACIÓN
// =========================================================

function restaurarBotonUbicacion() {

    const btn =
        document.getElementById(
            "btnUbicacion"
        );


    if (btn) {

        btn.disabled =
            false;

        btn.innerHTML = `
            <i class="material-icons left">
                location_on
            </i>
            Obtener ubicación
        `;

    }

}


// =========================================================
// RESTAURAR BOTÓN GUARDAR
// =========================================================

function restaurarBotonGuardar() {

    const btn =
        document.getElementById(
            "btnGuardar"
        );


    if (btn) {

        btn.disabled =
            false;

        btn.innerHTML = `
            <i class="material-icons left">
                save
            </i>
            Guardar
        `;

    }

}


// =========================================================
// MOSTRAR MENSAJE
// =========================================================

function mostrarMensaje(
    mensaje,
    tipo
) {

    // =====================================================
    // MATERIALIZE
    // =====================================================

    if (
        typeof M !== "undefined" &&
        M.toast
    ) {

        let clase =
            "";


        if (tipo === "success") {

            clase =
                "green";

        }
        else if (tipo === "error") {

            clase =
                "red";

        }


        M.toast({

            html:
                mensaje,

            classes:
                clase,

            displayLength:
                4000

        });


        return;

    }


    // =====================================================
    // FALLBACK
    // =====================================================

    alert(
        mensaje
    );

}
