let contenido = "";


// =========================================================
// VARIABLES DEL MAPA
// =========================================================

let mapa = null;
let marcador = null;


// =========================================================
// INICIALIZAR MATERIALIZE Y MAPA
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // MENÚ LATERAL
    // =========================================

    const menus = document.querySelectorAll(".sidenav");

    if (typeof M !== "undefined") {

        M.Sidenav.init(menus, {
            edge: "right"
        });

    }


    // =========================================
    // SELECTS
    // =========================================

    const selects = document.querySelectorAll("select");

    if (typeof M !== "undefined") {

        M.FormSelect.init(selects);

    }


    // =========================================
    // INICIALIZAR MAPA
    // =========================================

    inicializarMapa();


    // =========================================
    // BOTÓN UBICACIÓN
    // =========================================

    const btnUbicacion =
        document.getElementById("btnUbicacion");

    if (btnUbicacion) {

        btnUbicacion.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                obtenerUbicacion();

            }
        );

    }


    // =========================================
    // BOTÓN CANCELAR
    // =========================================

    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            function () {

                limpiarFormularioPedido();

            }
        );

    }


    // =========================================
    // BOTÓN GUARDAR
    // =========================================

    const btnGuardar =
        document.getElementById("btnGuardar");

    if (btnGuardar) {

        btnGuardar.addEventListener(
            "click",
            function () {

                guardarPedido();

            }
        );

    }

});


// =========================================================
// MAPA
// =========================================================

function inicializarMapa() {

    const elementoMapa =
        document.getElementById("map");

    if (!elementoMapa) {

        console.error(
            "No se encontró el elemento #map"
        );

        return;

    }


    // =========================================
    // COMPROBAR LEAFLET
    // =========================================

    if (typeof L === "undefined") {

        console.error(
            "Leaflet no está cargado."
        );

        return;

    }


    // =========================================
    // POSICIÓN INICIAL
    // Ciudad de México como vista inicial
    // =========================================

    mapa = L.map("map").setView(
        [19.4326, -99.1332],
        13
    );


    // =========================================
    // CAPA DEL MAPA
    // =========================================

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(mapa);


    console.log("Mapa inicializado correctamente.");

}


// =========================================================
// OBTENER UBICACIÓN
// =========================================================

function obtenerUbicacion() {

    const btnUbicacion =
        document.getElementById("btnUbicacion");


    const direccion =
        document.getElementById("txtDireccion");


    // =========================================
    // COMPROBAR GEOLOCALIZACIÓN
    // =========================================

    if (!navigator.geolocation) {

        alert(
            "Tu navegador no permite obtener la ubicación."
        );

        return;

    }


    // =========================================
    // CAMBIAR BOTÓN
    // =========================================

    if (btnUbicacion) {

        btnUbicacion.disabled = true;

        btnUbicacion.innerHTML = `
            <i class="material-icons left">
                gps_fixed
            </i>
            Obteniendo ubicación...
        `;

    }


    if (direccion) {

        direccion.value =
            "Obteniendo ubicación...";

    }


    // =========================================
    // SOLICITAR UBICACIÓN
    // =========================================

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            console.log(
                "Latitud:",
                lat
            );

            console.log(
                "Longitud:",
                lng
            );


            // =========================================
            // MOSTRAR EN MAPA
            // =========================================

            mostrarUbicacionEnMapa(
                lat,
                lng
            );


            // =========================================
            // OBTENER DIRECCIÓN
            // =========================================

            obtenerDireccion(
                lat,
                lng
            );


            // =========================================
            // RESTAURAR BOTÓN
            // =========================================

            restaurarBotonUbicacion();

        },


        function (error) {

            console.error(
                "Error de geolocalización:",
                error
            );


            if (direccion) {

                direccion.value = "";

            }


            let mensaje =
                "No se pudo obtener tu ubicación.";


            switch (error.code) {

                case error.PERMISSION_DENIED:

                    mensaje =
                        "Permiso de ubicación denegado. Activa la ubicación y permite el acceso al navegador.";

                    break;


                case error.POSITION_UNAVAILABLE:

                    mensaje =
                        "La ubicación no está disponible. Verifica el GPS o la conexión a Internet.";

                    break;


                case error.TIMEOUT:

                    mensaje =
                        "Se agotó el tiempo para obtener tu ubicación. Inténtalo nuevamente.";

                    break;

            }


            alert(mensaje);


            restaurarBotonUbicacion();

        },

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// =========================================================
// MOSTRAR UBICACIÓN EN EL MAPA
// =========================================================

function mostrarUbicacionEnMapa(
    lat,
    lng
) {

    if (!mapa) {

        inicializarMapa();

    }


    if (!mapa) {

        return;

    }


    // =========================================
    // CENTRAR MAPA
    // =========================================

    mapa.setView(
        [lat, lng],
        17
    );


    // =========================================
    // ELIMINAR MARCADOR ANTERIOR
    // =========================================

    if (marcador) {

        mapa.removeLayer(
            marcador
        );

    }


    // =========================================
    // CREAR MARCADOR
    // =========================================

    marcador =
        L.marker([
            lat,
            lng
        ]).addTo(mapa);


    // =========================================
    // POPUP
    // =========================================

    marcador.bindPopup(`
        <strong>Ubicación del pedido</strong><br>
        Latitud: ${lat.toFixed(6)}<br>
        Longitud: ${lng.toFixed(6)}
    `).openPopup();


    // =========================================
    // ACTUALIZAR MAPA
    // =========================================

    setTimeout(function () {

        mapa.invalidateSize();

    }, 300);

}


// =========================================================
// OBTENER DIRECCIÓN A PARTIR DE COORDENADAS
// =========================================================

async function obtenerDireccion(
    lat,
    lng
) {

    const direccion =
        document.getElementById("txtDireccion");


    try {

        const url =
            "https://nominatim.openstreetmap.org/reverse" +
            "?format=json" +
            "&lat=" + encodeURIComponent(lat) +
            "&lon=" + encodeURIComponent(lng) +
            "&zoom=18" +
            "&addressdetails=1";


        const respuesta =
            await fetch(url, {

                headers: {

                    "Accept":
                        "application/json"

                }

            });


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


        if (
            datos &&
            datos.display_name
        ) {

            if (direccion) {

                direccion.value =
                    datos.display_name;

            }


            // =========================================
            // ACTUALIZAR POPUP
            // =========================================

            if (marcador) {

                marcador.bindPopup(`
                    <strong>Ubicación del pedido</strong><br>
                    ${datos.display_name}
                `).openPopup();

            }

        }
        else {

            if (direccion) {

                direccion.value =
                    "Ubicación obtenida: " +
                    lat.toFixed(6) +
                    ", " +
                    lng.toFixed(6);

            }

        }

    }
    catch (error) {

        console.error(
            "Error obteniendo dirección:",
            error
        );


        if (direccion) {

            direccion.value =
                "Ubicación: " +
                lat.toFixed(6) +
                ", " +
                lng.toFixed(6);

        }

    }

}


// =========================================================
// RESTAURAR BOTÓN UBICACIÓN
// =========================================================

function restaurarBotonUbicacion() {

    const btnUbicacion =
        document.getElementById("btnUbicacion");


    if (!btnUbicacion) {

        return;

    }


    btnUbicacion.disabled =
        false;


    btnUbicacion.innerHTML = `
        <i class="material-icons left">
            location_on
        </i>
        Obtener ubicación
    `;

}


// =========================================================
// AGREGAR PLATILLO AL SELECT
// =========================================================

function agregarPlatilloAlSelect(
    platillo,
    id
) {

    /*
     * IMPORTANTE:
     * En pedidos.html tienes:
     *
     * id="listaplatillos"
     *
     * No "listaPlatillos".
     */

    const select =
        document.getElementById(
            "listaplatillos"
        );


    if (!select) {

        console.error(
            "No se encontró #listaplatillos"
        );

        return;

    }


    // =========================================
    // EVITAR DUPLICADOS
    // =========================================

    if (
        select.querySelector(
            `option[value="${id}"]`
        )
    ) {

        return;

    }


    const option =
        document.createElement(
            "option"
        );


    option.value =
        id;


    option.textContent =
        platillo.nombre ||
        "Platillo";


    select.appendChild(
        option
    );


    actualizarSelect(
        select
    );

}


// =========================================================
// ACTUALIZAR SELECT MATERIALIZE
// =========================================================

function actualizarSelect(
    select
) {

    if (
        typeof M === "undefined"
    ) {

        return;

    }


    const instancia =
        M.FormSelect.getInstance(
            select
        );


    if (instancia) {

        instancia.destroy();

    }


    M.FormSelect.init([
        select
    ]);

}


// =========================================================
// LIMPIAR LISTA DE PLATILLOS
// =========================================================

function limpiarListaPlatillos() {

    const select =
        document.getElementById(
            "listaplatillos"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option
            value=""
            selected
        >
            -- Selecciona un platillo --
        </option>

    `;


    actualizarSelect(
        select
    );

}


// =========================================================
// OBTENER PLATILLO SELECCIONADO
// =========================================================

function obtenerPlatilloSeleccionado() {

    const select =
        document.getElementById(
            "listaplatillos"
        );


    if (!select) {

        return null;

    }


    return select.value;

}


// =========================================================
// MOSTRAR PLATILLO
// =========================================================

function mostrarPlatillo(
    platillo,
    id
) {

    const recipes =
        document.querySelector(
            ".recipes"
        );


    if (!recipes) {

        return;

    }


    contenido = `

        <div
            class="card-panel recipe white row"
            id="${id}"
            data-id="${id}"
        >

            <div class="recipe-details">

                <div class="recipe-title">
                    ${platillo.nombre || ""}
                </div>

                <div class="recipe-ingredients">
                    ${platillo.ingredientes || ""}
                </div>

                <div class="recipe-price">
                    $${platillo.precio || 0} MXN
                </div>

            </div>

        </div>

    `;


    recipes.innerHTML +=
        contenido;

}


// =========================================================
// ACTUALIZAR PLATILLO
// =========================================================

function actualizarPlatillo(
    platillo,
    id
) {

    const tarjeta =
        document.getElementById(id);


    if (!tarjeta) {

        return;

    }


    const titulo =
        tarjeta.querySelector(
            ".recipe-title"
        );


    const ingredientes =
        tarjeta.querySelector(
            ".recipe-ingredients"
        );


    const precio =
        tarjeta.querySelector(
            ".recipe-price"
        );


    if (titulo) {

        titulo.innerHTML =
            platillo.nombre || "";

    }


    if (ingredientes) {

        ingredientes.innerHTML =
            platillo.ingredientes || "";

    }


    if (precio) {

        precio.innerHTML =
            `$${platillo.precio || 0} MXN`;

    }

}


// =========================================================
// BORRAR PLATILLO
// =========================================================

const borrarPlatillo =
    (id) => {

        const platillo =
            document.querySelector(
                `.recipe[data-id="${id}"]`
            );


        if (platillo) {

            platillo.remove();

        }

    };


// =========================================================
// LIMPIAR FORMULARIO DE PEDIDO
// =========================================================

function limpiarFormularioPedido() {

    const platillo =
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


    if (platillo) {

        platillo.value = "";

        actualizarSelect(
            platillo
        );

    }


    if (nombre) {

        nombre.value = "";

    }


    if (direccion) {

        direccion.value = "";

    }


    // =========================================
    // LIMPIAR MARCADOR
    // =========================================

    if (marcador && mapa) {

        mapa.removeLayer(
            marcador
        );

        marcador = null;

    }


    // =========================================
    // REGRESAR MAPA A VISTA INICIAL
    // =========================================

    if (mapa) {

        mapa.setView(
            [19.4326, -99.1332],
            13
        );

    }

}


// =========================================================
// GUARDAR PEDIDO
// =========================================================

function guardarPedido() {

    const platillo =
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


    if (!platillo || !platillo.value) {

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

        return;

    }


    if (
        !direccion ||
        !direccion.value.trim()
    ) {

        alert(
            "Obtén tu ubicación o escribe una dirección."
        );

        return;

    }


    const pedido = {

        platilloId:
            platillo.value,

        nombre:
            nombre.value.trim(),

        direccion:
            direccion.value.trim(),

        fecha:
            new Date().toISOString()

    };


    console.log(
        "Pedido:",
        pedido
    );


    /*
     * Aquí puedes guardar el pedido
     * en Firestore cuando quieras.
     */


    alert(
        "Pedido preparado correctamente."
    );

}


// =========================================================
// CÁMARA
// =========================================================

let streaming = false;

let width = 320;

let height = 0;

let video = null;

let canvas = null;

let foto = null;

let streamCamara = null;


// =========================================================
// PREPARAR CÁMARA
// =========================================================

function prepararCamara() {

    video =
        document.getElementById(
            "Video"
        );


    canvas =
        document.getElementById(
            "Canvas"
        );


    foto =
        document.getElementById(
            "foto"
        );

}


// =========================================================
// INICIAR CÁMARA
// =========================================================

async function iniciarCamara() {

    prepararCamara();


    const status =
        document.getElementById(
            "cameraStatus"
        );


    const error =
        document.getElementById(
            "cameraError"
        );


    if (!video) {

        console.error(
            "No se encontró #Video"
        );

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (error) {

            error.textContent =
                "La cámara no está disponible.";

        }

        return;

    }


    try {

        if (streamCamara) {

            detenerCamara();

        }


        if (status) {

            status.textContent =
                "Iniciando cámara...";

        }


        streamCamara =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    }

                },

                audio: false

            });


        video.srcObject =
            streamCamara;


        await video.play();


        video.onloadedmetadata =
            function () {

                if (!streaming) {

                    height =
                        video.videoHeight /
                        (
                            video.videoWidth /
                            width
                        );


                    if (
                        !height ||
                        !isFinite(height)
                    ) {

                        height = 240;

                    }


                    video.width =
                        width;

                    video.height =
                        height;


                    if (canvas) {

                        canvas.width =
                            width;

                        canvas.height =
                            height;

                    }


                    streaming = true;

                }

            };


        if (status) {

            status.textContent =
                "Cámara lista.";

        }


        if (error) {

            error.textContent =
                "";

        }

    }
    catch (err) {

        console.error(
            "Error al acceder a la cámara:",
            err
        );


        if (status) {

            status.textContent =
                "No se pudo iniciar la cámara.";

        }


        if (error) {

            error.textContent =
                "Verifica los permisos de cámara y HTTPS.";

        }

    }

}


// =========================================================
// TOMAR FOTO
// =========================================================

function tomarFoto() {

    prepararCamara();


    if (
        !video ||
        !canvas ||
        !foto
    ) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        return;

    }


    if (!streaming) {

        if (video.videoWidth > 0) {

            width = 320;

            height =
                video.videoHeight /
                (
                    video.videoWidth /
                    width
                );

        }
        else {

            height = 240;

        }

    }


    canvas.width =
        width;


    canvas.height =
        height;


    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    const fotoFinal =
        canvas.toDataURL(
            "image/png"
        );


    foto.src =
        fotoFinal;


    foto.style.display =
        "block";


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    if (fotoInput) {

        fotoInput.value =
            fotoFinal;

    }


    detenerCamara();


    const status =
        document.getElementById(
            "cameraStatus"
        );


    if (status) {

        status.textContent =
            "Foto tomada correctamente.";

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


        streamCamara = null;

    }


    if (video) {

        video.srcObject =
            null;

    }


    streaming =
        false;

}


// =========================================================
// LIMPIAR FOTO
// =========================================================

function limpiarFoto() {

    prepararCamara();


    if (foto) {

        foto.src = "";

        foto.style.display =
            "none";

    }


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    if (fotoInput) {

        fotoInput.value =
            "";

    }


    if (canvas) {

        const context =
            canvas.getContext(
                "2d"
            );


        if (context) {

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }

    }


    detenerCamara();


    const status =
        document.getElementById(
            "cameraStatus"
        );


    const error =
        document.getElementById(
            "cameraError"
        );


    if (status) {

        status.textContent =
            "Cámara lista para tomar una foto.";

    }


    if (error) {

        error.textContent =
            "";

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
