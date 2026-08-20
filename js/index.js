// =========================================================
// DITS - INDEX.JS
// =========================================================


// =========================================================
// VARIABLES GLOBALES
// =========================================================

let map = null;
let marcador = null;

let platillos = {};

let cameraStream = null;

let cameraActive = false;


// =========================================================
// INICIO
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚS MATERIALIZE
    // =====================================================

    const menus =
        document.querySelectorAll(".sidenav");

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
    // CARGAR PEDIDOS
    // =====================================================

    cargarPedidosEnIndex();


    // =====================================================
    // CARGAR CÁMARA
    // =====================================================

    iniciarCamara();


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
    // BOTÓN CANCELAR
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
    // BOTÓN GUARDAR
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

});


// =========================================================
// CÁMARA
// =========================================================

function iniciarCamara() {

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


    const inputFoto =
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


    if (!video) {

        console.warn(
            "No se encontró el elemento Video."
        );

        return;

    }


    // =====================================================
    // USAR CÁMARA
    // =====================================================

    if (btnCamara) {

        btnCamara.addEventListener(
            "click",
            abrirCamara
        );

    }


    // =====================================================
    // CAPTURAR FOTO
    // =====================================================

    if (btnCapturar) {

        btnCapturar.addEventListener(
            "click",
            capturarFoto
        );

    }


    // =====================================================
    // LIMPIAR
    // =====================================================

    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            limpiarCamara
        );

    }


    // =====================================================
    // SELECCIONAR IMAGEN
    // =====================================================

    if (inputFoto) {

        inputFoto.addEventListener(
            "change",
            function () {

                const archivo =
                    this.files &&
                    this.files[0];


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


                        const fotoInput =
                            document.getElementById(
                                "fotoInput"
                            );


                        if (fotoInput) {

                            fotoInput.value =
                                imagen;

                        }


                        mostrarEstadoCamara(
                            "Imagen seleccionada correctamente."
                        );

                    };


                lector.onerror =
                    function () {

                        mostrarErrorCamara(
                            "No se pudo cargar la imagen."
                        );

                    };


                lector.readAsDataURL(
                    archivo
                );

            }
        );

    }

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

        console.error(
            "No existe el elemento Video."
        );

        return;

    }


    // =====================================================
    // VERIFICAR SOPORTE
    // =====================================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        mostrarErrorCamara(
            "Tu navegador no permite utilizar la cámara."
        );

        return;

    }


    // =====================================================
    // CERRAR CÁMARA ANTERIOR
    // =====================================================

    detenerCamara();


    mostrarErrorCamara("");


    mostrarEstadoCamara(
        "Solicitando acceso a la cámara..."
    );


    try {

        // =================================================
        // INTENTAR CÁMARA TRASERA
        // =================================================

        cameraStream =
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
            cameraStream;


        video.style.display =
            "block";


        await video.play();


        cameraActive = true;


        mostrarEstadoCamara(
            "Cámara activa. Apunta al platillo y presiona Capturar."
        );


        // =================================================
        // ACTUALIZAR BOTÓN
        // =================================================

        const btnCamara =
            document.getElementById(
                "btnCamara"
            );


        if (btnCamara) {

            btnCamara.innerHTML = `
                <i class="material-icons left">
                    videocam
                </i>
                Cámara activa
            `;

        }


    }

    catch (error) {

        console.error(
            "Error al abrir la cámara:",
            error
        );


        cameraActive = false;


        let mensaje =
            "No se pudo abrir la cámara.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            mensaje =
                "Permiso de cámara denegado. Autoriza la cámara en tu navegador.";

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            mensaje =
                "No se encontró ninguna cámara en el dispositivo.";

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


    const foto =
        document.getElementById(
            "foto"
        );


    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    if (!video || !canvas || !foto) {

        mostrarErrorCamara(
            "No se encontraron los elementos necesarios para tomar la foto."
        );

        return;

    }


    if (
        !cameraStream ||
        !cameraActive
    ) {

        mostrarErrorCamara(
            "Primero presiona 'Usar cámara'."
        );

        return;

    }


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        mostrarErrorCamara(
            "La cámara todavía no está lista. Espera un momento."
        );

        return;

    }


    // =====================================================
    // TAMAÑO REAL DE LA CÁMARA
    // =====================================================

    canvas.width =
        video.videoWidth;


    canvas.height =
        video.videoHeight;


    const contexto =
        canvas.getContext(
            "2d"
        );


    contexto.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // =====================================================
    // CONVERTIR A IMAGEN
    // =====================================================

    const imagen =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );


    // =====================================================
    // MOSTRAR FOTO
    // =====================================================

    foto.src =
        imagen;


    foto.style.display =
        "block";


    // =====================================================
    // GUARDAR EN INPUT OCULTO
    // =====================================================

    if (fotoInput) {

        fotoInput.value =
            imagen;

    }


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerCamara();


    mostrarEstadoCamara(
        "Foto capturada correctamente."
    );


    // =====================================================
    // BOTÓN
    // =====================================================

    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    if (btnCamara) {

        btnCamara.innerHTML = `
            <i class="material-icons left">
                camera_alt
            </i>
            Usar cámara
        `;

    }

}


// =========================================================
// DETENER CÁMARA
// =========================================================

function detenerCamara() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

        cameraStream =
            null;

    }


    const video =
        document.getElementById(
            "Video"
        );


    if (video) {

        video.srcObject =
            null;

    }


    cameraActive =
        false;

}


// =========================================================
// LIMPIAR CÁMARA
// =========================================================

function limpiarCamara() {

    detenerCamara();


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


    const inputFoto =
        document.getElementById(
            "btnFoto"
        );


    if (video) {

        video.srcObject =
            null;

    }


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

    }


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


    if (inputFoto) {

        inputFoto.value =
            "";

    }


    const btnCamara =
        document.getElementById(
            "btnCamara"
        );


    if (btnCamara) {

        btnCamara.innerHTML = `
            <i class="material-icons left">
                camera_alt
            </i>
            Usar cámara
        `;

    }


    mostrarErrorCamara("");


    mostrarEstadoCamara(
        "Cámara lista para tomar una foto."
    );

}


// =========================================================
// ESTADO DE CÁMARA
// =========================================================

function mostrarEstadoCamara(
    mensaje
) {

    const elemento =
        document.getElementById(
            "cameraStatus"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        "center green-text";

}


// =========================================================
// ERROR DE CÁMARA
// =========================================================

function mostrarErrorCamara(
    mensaje
) {

    const elemento =
        document.getElementById(
            "cameraError"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    if (mensaje) {

        elemento.className =
            "center red-text";

    }

}


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


    const posicionInicial = [
        19.4326,
        -99.1332
    ];


    map =
        L.map("map")
            .setView(
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
        typeof db ===
        "undefined"
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
                    typeof M !==
                    "undefined"
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

    if (
        typeof db ===
        "undefined"
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


                        idsActuales.push(
                            id
                        );


                        const platillo = {

                            nombre:
                                pedido.platillo ||
                                "Sin nombre",

                            ingredientes:
                                pedido.ingredientes ||
                                "Sin ingredientes",

                            precio:
                                parseFloat(
                                    pedido.precio ||
                                    0
                                ),

                            foto:
                                pedido.foto ||
                                ""

                        };


                        const tarjetaExistente =
                            document.getElementById(
                                "pedido_" +
                                id
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


                // =============================================
                // ELIMINAR TARJETAS QUE YA NO EXISTEN
                // =============================================

                const tarjetas =
                    contenedor.querySelectorAll(
                        ".recipe[data-id]"
                    );


                tarjetas.forEach(
                    function (tarjeta) {

                        const id =
                            tarjeta.getAttribute(
                                "data-id"
                            );


                        if (
                            id &&
                            !idsActuales.includes(
                                id
                            )
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


    const precio =
        parseFloat(
            platillo.precio ||
            0
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
                Ingredientes:
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
                style="margin-top:10px;"
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


    if (
        typeof db ===
        "undefined"
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
                    typeof M !==
                    "undefined"
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

function mostrarInformacionPlatillo(
    id
) {

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
            platillo.precio ||
            0
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
        typeof M !==
        "undefined"
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


    if (
        !navigator.geolocation
    ) {

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

            enableHighAccuracy:
                true,

            timeout:
                20000,

            maximumAge:
                0

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
        typeof M !==
        "undefined"
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
            datos.address ||
            {};


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
                ", C.P. " +
                codigoPostal;

        }


        if (
            !direccionFinal.trim()
        ) {

            direccionFinal =
                datos.display_name ||
                `${latitud}, ${longitud}`;

        }


        if (direccion) {

            direccion.value =
                direccionFinal;

        }


        if (
            typeof M !==
            "undefined"
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
            typeof M !==
            "undefined"
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
            platillo.precio ||
            0
        );


    const pedido = {

        platilloId:
            lista.value,

        platillo:
            platillo.nombre ||
            "",

        ingredientes:
            platillo.ingredientes ||
            "",

        precio:
            precio,

        foto:
            platillo.foto ||
            "",

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
        typeof db ===
        "undefined"
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


                // =================================================
                // REGRESAR AL INDEX
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
        typeof M !==
        "undefined"
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
// DETENER CÁMARA AL SALIR DE LA PÁGINA
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        detenerCamara();

    }
);
