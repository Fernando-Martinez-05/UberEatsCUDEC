// =====================================================
// VARIABLES
// =====================================================

let contenido = "";


// =====================================================
// INICIALIZAR MATERIALIZE
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // CARGAR PLATILLOS GUARDADOS DESDE PEDIDOS
    // =====================================================

    cargarPlatillosDesdePedidos();


    // =====================================================
    // CARGAR PLATILLO NUEVO PENDIENTE
    // =====================================================

    cargarNuevoPlatilloDesdePedido();


    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const menus =
        document.querySelectorAll(".side-menu");

    if (menus.length > 0) {

        M.Sidenav.init(
            menus,
            {
                edge: "right"
            }
        );

    }


    // =====================================================
    // FORMULARIO LATERAL
    // =====================================================

    const forms =
        document.querySelectorAll(".side-form");

    if (forms.length > 0) {

        M.Sidenav.init(
            forms,
            {
                edge: "left"
            }
        );

    }

});


// =====================================================
// MOSTRAR PLATILLO
// =====================================================

function mostrarPlatillo(
    platillo,
    id
) {

    // =====================================================
    // EVITAR DUPLICADOS VISUALES
    // =====================================================

    if (document.getElementById(id)) {
        return;
    }


    let fotoPlatillo = "";


    // =====================================================
    // FOTOGRAFÍA
    // =====================================================

    if (
        platillo.foto &&
        platillo.foto !== ""
    ) {

        fotoPlatillo =
            platillo.foto;

    }


    let imagenHTML = "";


    // =====================================================
    // MOSTRAR IMAGEN
    // =====================================================

    if (fotoPlatillo !== "") {

        imagenHTML = `
            <img
                src="${fotoPlatillo}"
                height="100"
                width="100"
                style="
                    object-fit: cover;
                    border-radius: 10px;
                "
                alt="${platillo.nombre || "Platillo"}"
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
    // TARJETA
    // =====================================================

    contenido = `

        <div
            class="card-panel recipe white row"
            id="${id}"
            data-id="${id}"
        >

            ${imagenHTML}


            <div class="recipe-details">

                <div class="recipe-title">
                    ${platillo.nombre || "Sin nombre"}
                </div>


                <div class="recipe-ingredients">
                    ${platillo.ingredientes || "Sin ingredientes"}
                </div>


                <div class="recipe-price">
                    $${platillo.precio || "0"} MXN
                </div>


                <div class="recipe-delete">

                    <i
                        class="material-icons"
                        data-id="${id}"
                    >
                        delete_outline
                    </i>

                </div>

            </div>

        </div>

    `;


    const contenedor =
        document.querySelector(
            ".recipes"
        );


    if (contenedor) {

        contenedor.insertAdjacentHTML(
            "beforeend",
            contenido
        );

    }

}


// =====================================================
// ACTUALIZAR PLATILLO
// =====================================================

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
            platillo.nombre ||
            "Sin nombre";

    }


    if (ingredientes) {

        ingredientes.innerHTML =
            platillo.ingredientes ||
            "Sin ingredientes";

    }


    if (precio) {

        precio.innerHTML =
            `$${platillo.precio || "0"} MXN`;

    }

}


// =====================================================
// BORRAR PLATILLO VISUALMENTE
// =====================================================

function borrarPlatillo(
    id
) {

    const platillo =
        document.querySelector(
            `.recipe[data-id="${id}"]`
        );


    if (platillo) {

        platillo.remove();

    }

}


// =====================================================
// AGREGAR PLATILLO A LA LISTA
// =====================================================

function agregarALista(
    platillo,
    id
) {

    const lista =
        document.getElementById(
            "listaplatillos"
        );


    // =====================================================
    // SI NO EXISTE LA LISTA
    // =====================================================

    if (!lista) {
        return;
    }


    // =====================================================
    // EVITAR OPCIONES DUPLICADAS
    // =====================================================

    const opcionExistente =
        lista.querySelector(
            `option[value="${id}"]`
        );


    if (opcionExistente) {
        return;
    }


    const opcion =
        document.createElement(
            "option"
        );


    opcion.value =
        id;


    opcion.textContent =
        platillo.nombre ||
        "Sin nombre";


    lista.appendChild(
        opcion
    );

}


// =====================================================
// CARGAR PLATILLO NUEVO DESDE PEDIDOS
// =====================================================

function cargarNuevoPlatilloDesdePedido() {

    const datos =
        localStorage.getItem(
            "nuevoPlatilloIndex"
        );


    // =====================================================
    // NO EXISTE PLATILLO NUEVO
    // =====================================================

    if (!datos) {
        return;
    }


    try {

        const platillo =
            JSON.parse(datos);


        if (!platillo) {
            return;
        }


        // =================================================
        // CREAR ID
        // =================================================

        const id =
            platillo.id ||
            "pedido_" +
            Date.now();


        // =================================================
        // MOSTRAR EN INDEX
        // =================================================

        mostrarPlatillo(
            platillo,
            id
        );


        // =================================================
        // GUARDAR EN LISTA PERMANENTE
        // =================================================

        guardarPlatilloLocal(
            platillo,
            id
        );


        console.log(
            "Platillo agregado desde pedidos:",
            platillo
        );


        // =================================================
        // ELIMINAR PENDIENTE
        // =================================================

        localStorage.removeItem(
            "nuevoPlatilloIndex"
        );

    }

    catch (error) {

        console.error(
            "Error leyendo el platillo guardado:",
            error
        );

    }

}


// =====================================================
// GUARDAR PLATILLO EN LOCALSTORAGE
// =====================================================

function guardarPlatilloLocal(
    platillo,
    id
) {

    let platillos = [];


    try {

        const datos =
            localStorage.getItem(
                "platillosIndex"
            );


        if (datos) {

            platillos =
                JSON.parse(datos);

        }


        if (!Array.isArray(platillos)) {

            platillos = [];

        }

    }

    catch (error) {

        console.error(
            "Error leyendo platillos locales:",
            error
        );

        platillos = [];

    }


    // =====================================================
    // COMPROBAR SI YA EXISTE
    // =====================================================

    const existe =
        platillos.some(
            function (item) {

                return item.id === id;

            }
        );


    if (!existe) {

        platillos.push({

            id: id,

            nombre:
                platillo.nombre ||
                "Sin nombre",

            ingredientes:
                platillo.ingredientes ||
                "Sin ingredientes",

            precio:
                platillo.precio ||
                "0",

            foto:
                platillo.foto ||
                ""

        });

    }


    // =====================================================
    // GUARDAR
    // =====================================================

    try {

        localStorage.setItem(
            "platillosIndex",
            JSON.stringify(platillos)
        );

    }

    catch (error) {

        console.error(
            "Error guardando platillos:",
            error
        );

    }

}


// =====================================================
// CARGAR TODOS LOS PLATILLOS GUARDADOS
// =====================================================

function cargarPlatillosDesdePedidos() {

    const datos =
        localStorage.getItem(
            "platillosIndex"
        );


    if (!datos) {
        return;
    }


    try {

        const platillos =
            JSON.parse(datos);


        if (!Array.isArray(platillos)) {
            return;
        }


        platillos.forEach(
            function (platillo) {

                if (!platillo) {
                    return;
                }


                const id =
                    platillo.id ||
                    "pedido_" +
                    Date.now();


                mostrarPlatillo(
                    platillo,
                    id
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Error cargando platillos guardados:",
            error
        );

    }

}


// =====================================================
// ESCUCHAR NUEVOS PEDIDOS DESDE PEDIDOS.HTML
// =====================================================
//
// Esto permite que si index.html está abierto y desde
// otra pestaña se agrega un pedido, el platillo aparezca
// automáticamente.
//
// =====================================================

window.addEventListener(
    "storage",
    function (event) {

        // =================================================
        // SOLO NOS INTERESA ESTA CLAVE
        // =================================================

        if (
            event.key !==
            "nuevoPlatilloIndex"
        ) {

            return;

        }


        // =================================================
        // NO HAY NUEVO VALOR
        // =================================================

        if (!event.newValue) {
            return;
        }


        try {

            const platillo =
                JSON.parse(
                    event.newValue
                );


            if (!platillo) {
                return;
            }


            // =================================================
            // ID
            // =================================================

            const id =
                platillo.id ||
                "pedido_" +
                Date.now();


            // =================================================
            // MOSTRAR
            // =================================================

            mostrarPlatillo(
                platillo,
                id
            );


            // =================================================
            // GUARDAR PERMANENTEMENTE
            // =================================================

            guardarPlatilloLocal(
                platillo,
                id
            );


            console.log(
                "Nuevo platillo recibido desde pedidos.html:",
                platillo
            );

        }

        catch (error) {

            console.error(
                "Error procesando nuevo pedido:",
                error
            );

        }

    }
);


// =====================================================
// CÁMARA
// =====================================================

let streaming = false;

let width = 320;

let height = 0;


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


const btnFoto =
    document.getElementById(
        "btnFoto"
    );


const btnCapturar =
    document.getElementById(
        "btnCapturar"
    );


const btnLimpiar =
    document.getElementById(
        "btnLimpiar"
    );


const btnCamara =
    document.getElementById(
        "btnCamara"
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
// SELECCIONAR IMAGEN DESDE GALERÍA
// =====================================================

if (btnFoto) {

    btnFoto.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    const fotoFinal =
                        e.target.result;


                    if (foto) {

                        foto.setAttribute(
                            "src",
                            fotoFinal
                        );


                        foto.style.display =
                            "block";

                    }


                    const fotoInput =
                        document.getElementById(
                            "fotoInput"
                        );


                    if (fotoInput) {

                        fotoInput.value =
                            fotoFinal;

                    }


                    if (cameraStatus) {

                        cameraStatus.textContent =
                            "Imagen seleccionada correctamente.";

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// =====================================================
// CUANDO EL VIDEO ESTÁ LISTO
// =====================================================

if (video) {

    video.addEventListener(
        "canplay",
        function () {

            if (streaming) {
                return;
            }


            if (
                video.videoWidth &&
                video.videoHeight
            ) {

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


            video.setAttribute(
                "width",
                width
            );


            video.setAttribute(
                "height",
                height
            );


            if (canvas) {

                canvas.setAttribute(
                    "width",
                    width
                );


                canvas.setAttribute(
                    "height",
                    height
                );

            }


            streaming = true;

        }
    );

}


// =====================================================
// ABRIR CÁMARA
// =====================================================

if (btnCamara) {

    btnCamara.addEventListener(
        "click",
        async function (e) {

            e.preventDefault();


            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                if (cameraError) {

                    cameraError.textContent =
                        "Tu navegador no permite acceder a la cámara.";

                }

                return;

            }


            try {

                if (cameraError) {

                    cameraError.textContent =
                        "";

                }


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Solicitando acceso a la cámara...";

                }


                // =================================================
                // CONFIGURACIÓN DE CÁMARA
                // =================================================

                const stream =
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


                // =================================================
                // ASIGNAR STREAM
                // =================================================

                video.srcObject =
                    stream;


                video.setAttribute(
                    "playsinline",
                    ""
                );


                video.setAttribute(
                    "autoplay",
                    ""
                );


                video.muted =
                    true;


                await video.play();


                // =================================================
                // MOSTRAR CÁMARA
                // =================================================

                const camera =
                    document.getElementById(
                        "Camera"
                    );


                if (camera) {

                    camera.style.display =
                        "block";

                }


                if (foto) {

                    foto.style.display =
                        "none";

                }


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara activada. Puedes capturar la foto.";

                }

            }

            catch (error) {

                console.error(
                    "Error al acceder a la cámara:",
                    error
                );


                if (!cameraError) {
                    return;
                }


                if (
                    error.name ===
                    "NotAllowedError"
                ) {

                    cameraError.textContent =
                        "Permiso de cámara denegado. Autoriza la cámara en el navegador.";

                }

                else if (
                    error.name ===
                    "NotFoundError"
                ) {

                    cameraError.textContent =
                        "No se encontró ninguna cámara.";

                }

                else if (
                    error.name ===
                    "NotReadableError"
                ) {

                    cameraError.textContent =
                        "La cámara está siendo utilizada por otra aplicación.";

                }

                else if (
                    error.name ===
                    "SecurityError"
                ) {

                    cameraError.textContent =
                        "El navegador bloqueó el acceso a la cámara. Usa HTTPS o localhost.";

                }

                else {

                    cameraError.textContent =
                        "No se pudo abrir la cámara.";

                }

            }

        }
    );

}


// =====================================================
// TOMAR FOTO
// =====================================================

function tomarFoto() {

    if (
        !video ||
        !canvas ||
        !foto
    ) {

        return;

    }


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        alert(
            "Primero debes abrir la cámara."
        );

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    const ancho =
        video.videoWidth;


    const alto =
        video.videoHeight;


    canvas.width =
        ancho;


    canvas.height =
        alto;


    context.drawImage(
        video,
        0,
        0,
        ancho,
        alto
    );


    const fotoFinal =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );


    foto.setAttribute(
        "src",
        fotoFinal
    );


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


    // =================================================
    // OCULTAR CÁMARA
    // =================================================

    const camera =
        document.getElementById(
            "Camera"
        );


    if (camera) {

        camera.style.display =
            "none";

    }


    // =================================================
    // DETENER CÁMARA
    // =================================================

    detenerCamara();


    streaming =
        false;


    if (cameraStatus) {

        cameraStatus.textContent =
            "Foto capturada correctamente.";

    }

}


// =====================================================
// DETENER CÁMARA
// =====================================================

function detenerCamara() {

    if (
        video &&
        video.srcObject
    ) {

        const tracks =
            video.srcObject.getTracks();


        tracks.forEach(
            function (track) {

                track.stop();

            }
        );


        video.srcObject =
            null;

    }

}


// =====================================================
// BOTÓN CAPTURAR
// =====================================================

if (btnCapturar) {

    btnCapturar.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            tomarFoto();

        }
    );

}


// =====================================================
// LIMPIAR FOTO
// =====================================================

function limpiarFoto() {

    // =================================================
    // LIMPIAR IMAGEN
    // =================================================

    if (foto) {

        foto.setAttribute(
            "src",
            ""
        );


        foto.style.display =
            "none";

    }


    // =================================================
    // LIMPIAR INPUT
    // =================================================

    const fotoInput =
        document.getElementById(
            "fotoInput"
        );


    if (fotoInput) {

        fotoInput.value =
            "";

    }


    // =================================================
    // DETENER CÁMARA
    // =================================================

    detenerCamara();


    // =================================================
    // REINICIAR VIDEO
    // =================================================

    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();

    }


    // =================================================
    // MOSTRAR CONTENEDOR
    // =================================================

    const camera =
        document.getElementById(
            "Camera"
        );


    if (camera) {

        camera.style.display =
            "block";

    }


    // =================================================
    // LIMPIAR INPUT DE ARCHIVO
    // =================================================

    if (btnFoto) {

        btnFoto.value =
            "";

    }


    streaming =
        false;


    if (cameraStatus) {

        cameraStatus.textContent =
            "Cámara lista para tomar una foto.";

    }


    if (cameraError) {

        cameraError.textContent =
            "";

    }

}


// =====================================================
// BOTÓN LIMPIAR
// =====================================================

if (btnLimpiar) {

    btnLimpiar.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            limpiarFoto();

        }
    );

}


// =====================================================
// CERRAR CÁMARA AL CERRAR FORMULARIO
// =====================================================

const sideForm =
    document.getElementById(
        "side-form"
    );


if (sideForm) {

    sideForm.addEventListener(
        "click",
        function () {

            // Se mantiene disponible la cámara.

        }
    );

}


// =====================================================
// EXPORTAR FUNCIONES PARA DB.JS
// =====================================================

window.mostrarPlatillo =
    mostrarPlatillo;


window.actualizarPlatillo =
    actualizarPlatillo;


window.borrarPlatillo =
    borrarPlatillo;


window.agregarALista =
    agregarALista;


window.guardarPlatilloLocal =
    guardarPlatilloLocal;


window.cargarPlatillosDesdePedidos =
    cargarPlatillosDesdePedidos;
