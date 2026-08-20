let contenido = "";


// =========================================================
// INICIALIZAR MATERIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // MENÚS LATERALES
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
    // BOTÓN USAR CÁMARA
    // =========================================

    const btnCamara = document.getElementById("btnCamara");

    if (btnCamara) {

        btnCamara.addEventListener("click", function (event) {

            event.preventDefault();

            iniciarCamara();

        });

    }


    // =========================================
    // BOTÓN CAPTURAR
    // =========================================

    const btnCapturar = document.getElementById("btnCapturar");

    if (btnCapturar) {

        btnCapturar.addEventListener("click", function (event) {

            event.preventDefault();

            tomarFoto();

        });

    }


    // =========================================
    // BOTÓN LIMPIAR
    // =========================================

    const btnLimpiar = document.getElementById("btnLimpiar");

    if (btnLimpiar) {

        btnLimpiar.addEventListener("click", function (event) {

            event.preventDefault();

            limpiarFoto();

        });

    }


    // =========================================
    // DETENER CÁMARA AL CERRAR FORMULARIO
    // =========================================

    const sideForm = document.getElementById("side-form");

    if (sideForm) {

        sideForm.addEventListener(
            "sidenav:close",
            function () {

                detenerCamara();

            }
        );

    }


    // =========================================
    // FORMULARIO
    // =========================================

    const formAgregar =
        document.getElementById("formAgregar");

    if (formAgregar) {

        formAgregar.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

            }
        );

    }

});


// =========================================================
// MOSTRAR PLATILLO
// =========================================================

function mostrarPlatillo(platillo, id) {

    const recipes =
        document.querySelector(".recipes");

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


    recipes.innerHTML += contenido;

}


// =========================================================
// ACTUALIZAR PLATILLO
// =========================================================

function actualizarPlatillo(platillo, id) {

    const tarjeta =
        document.getElementById(id);

    if (!tarjeta) {

        return;

    }


    const titulo =
        tarjeta.querySelector(".recipe-title");

    const ingredientes =
        tarjeta.querySelector(".recipe-ingredients");

    const precio =
        tarjeta.querySelector(".recipe-price");


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

const borrarPlatillo = (id) => {

    const platillo =
        document.querySelector(
            `.recipe[data-id="${id}"]`
        );


    if (platillo) {

        platillo.remove();

    }

};


// =========================================================
// AGREGAR PLATILLO AL SELECT
// =========================================================

function agregarPlatilloAlSelect(platillo, id) {

    const select =
        document.getElementById("listaPlatillos");

    if (!select) {

        return;

    }


    const option =
        document.createElement("option");


    option.value =
        id;


    option.textContent =
        platillo.nombre || "Platillo";


    select.appendChild(option);


    actualizarSelect(select);

}


// =========================================================
// ACTUALIZAR SELECT MATERIALIZE
// =========================================================

function actualizarSelect(select) {

    if (typeof M === "undefined") {

        return;

    }


    const instancia =
        M.FormSelect.getInstance(select);


    if (instancia) {

        instancia.destroy();

    }


    M.FormSelect.init(select);

}


// =========================================================
// LIMPIAR LISTA DE PLATILLOS
// =========================================================

function limpiarListaPlatillos() {

    const select =
        document.getElementById("listaPlatillos");

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option
            value=""
            disabled
            selected
        >

            Elige un platillo

        </option>

    `;


    actualizarSelect(select);

}


// =========================================================
// OBTENER PLATILLO SELECCIONADO
// =========================================================

function obtenerPlatilloSeleccionado() {

    const select =
        document.getElementById("listaPlatillos");

    if (!select) {

        return null;

    }


    return select.value;

}


// =========================================================
// LIMPIAR FORMULARIO
// =========================================================

function limpiarFormularioPlatillo() {

    const form =
        document.getElementById("formAgregar");

    if (!form) {

        return;

    }


    form.reset();

}


// =========================================================
// VARIABLES DE CÁMARA
// =========================================================

let streaming = false;

let width = 640;

let height = 480;

let video = null;

let canvas = null;

let foto = null;

let streamCamara = null;


// =========================================================
// OBTENER ELEMENTOS DE CÁMARA
// =========================================================

function prepararCamara() {

    video =
        document.getElementById("Video");

    canvas =
        document.getElementById("Canvas");

    foto =
        document.getElementById("foto");

}


// =========================================================
// INICIAR CÁMARA
// =========================================================

async function iniciarCamara() {

    prepararCamara();


    const status =
        document.getElementById("cameraStatus");

    const error =
        document.getElementById("cameraError");


    // =========================================
    // COMPROBAR VIDEO
    // =========================================

    if (!video) {

        console.error(
            "No se encontró el elemento #Video."
        );

        if (error) {

            error.textContent =
                "No se encontró el elemento de cámara.";

        }

        return;

    }


    // =========================================
    // COMPROBAR CONTEXTO SEGURO
    // =========================================

    const esLocalhost =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";


    if (
        !window.isSecureContext &&
        !esLocalhost
    ) {

        if (status) {

            status.textContent =
                "No se puede acceder a la cámara.";

        }


        if (error) {

            error.textContent =
                "La cámara del teléfono requiere HTTPS.";

        }

        return;

    }


    // =========================================
    // COMPROBAR getUserMedia
    // =========================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (status) {

            status.textContent =
                "Cámara no disponible.";

        }


        if (error) {

            error.textContent =
                "Tu navegador no permite utilizar la cámara.";

        }

        return;

    }


    try {

        // =========================================
        // DETENER STREAM ANTERIOR
        // =========================================

        detenerCamara();


        if (status) {

            status.textContent =
                "Solicitando permiso para usar la cámara...";

        }


        if (error) {

            error.textContent = "";

        }


        // =========================================
        // PRIMER INTENTO
        // CÁMARA TRASERA
        // =========================================

        try {

            streamCamara =
                await navigator.mediaDevices.getUserMedia({

                    video: {

                        facingMode: {
                            exact: "environment"
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

        }
        catch (primerError) {

            console.warn(
                "No se pudo seleccionar environment exacto.",
                primerError
            );


            // =========================================
            // SEGUNDO INTENTO
            // MÁS COMPATIBLE
            // =========================================

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

        }


        // =========================================
        // ASIGNAR STREAM
        // =========================================

        video.srcObject =
            streamCamara;


        video.autoplay =
            true;


        video.muted =
            true;


        video.playsInline =
            true;


        // =========================================
        // ESPERAR METADATA
        // =========================================

        await new Promise(function (resolve) {

            if (
                video.readyState >= 1 &&
                video.videoWidth > 0
            ) {

                resolve();

                return;

            }


            video.addEventListener(
                "loadedmetadata",
                function () {

                    resolve();

                },
                {
                    once: true
                }
            );

        });


        // =========================================
        // REPRODUCIR
        // =========================================

        await video.play();


        // =========================================
        // OBTENER DIMENSIONES
        // =========================================

        if (
            video.videoWidth > 0 &&
            video.videoHeight > 0
        ) {

            width =
                video.videoWidth;

            height =
                video.videoHeight;

        }
        else {

            width =
                640;

            height =
                480;

        }


        // =========================================
        // CONFIGURAR CANVAS
        // =========================================

        if (canvas) {

            canvas.width =
                width;

            canvas.height =
                height;

        }


        // =========================================
        // ACTIVAR STREAMING
        // =========================================

        streaming =
            true;


        // =========================================
        // INFORMACIÓN DE LA CÁMARA
        // =========================================

        const tracks =
            streamCamara.getVideoTracks();


        if (tracks.length > 0) {

            const settings =
                tracks[0].getSettings();


            console.log(
                "Cámara utilizada:",
                settings
            );

        }


        // =========================================
        // ESTADO
        // =========================================

        if (status) {

            status.textContent =
                "Cámara trasera activada.";

        }


        if (error) {

            error.textContent = "";

        }

    }
    catch (err) {

        console.error(
            "Error al acceder a la cámara:",
            err
        );


        detenerCamara();


        if (status) {

            status.textContent =
                "No se pudo iniciar la cámara.";

        }


        if (error) {

            switch (err.name) {

                case "NotAllowedError":

                    error.textContent =
                        "Permiso de cámara rechazado. Permite el acceso a la cámara en el navegador.";

                    break;


                case "NotFoundError":

                    error.textContent =
                        "No se encontró ninguna cámara disponible.";

                    break;


                case "NotReadableError":

                    error.textContent =
                        "La cámara está siendo utilizada por otra aplicación.";

                    break;


                case "SecurityError":

                    error.textContent =
                        "El navegador bloqueó el acceso a la cámara.";

                    break;


                case "OverconstrainedError":

                    error.textContent =
                        "No se pudo seleccionar la cámara trasera.";

                    break;


                default:

                    error.textContent =
                        "Error de cámara: " +
                        err.message;

                    break;

            }

        }

    }

}


// =========================================================
// TOMAR FOTO
// =========================================================

function tomarFoto() {

    prepararCamara();


    // =========================================
    // COMPROBAR ELEMENTOS
    // =========================================

    if (
        !video ||
        !canvas ||
        !foto
    ) {

        console.error(
            "No se encontraron los elementos necesarios para tomar la foto."
        );

        return;

    }


    // =========================================
    // COMPROBAR STREAM
    // =========================================

    if (
        !streamCamara ||
        !streaming ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        const status =
            document.getElementById("cameraStatus");


        const error =
            document.getElementById("cameraError");


        if (status) {

            status.textContent =
                "La cámara todavía no está lista.";

        }


        if (error) {

            error.textContent =
                "Pulsa primero 'Usar cámara'.";

        }

        return;

    }


    // =========================================
    // CONTEXTO DEL CANVAS
    // =========================================

    const context =
        canvas.getContext("2d");


    if (!context) {

        console.error(
            "No se pudo obtener el contexto del canvas."
        );

        return;

    }


    // =========================================
    // DIMENSIONES REALES
    // =========================================

    const videoWidth =
        video.videoWidth;


    const videoHeight =
        video.videoHeight;


    canvas.width =
        videoWidth;


    canvas.height =
        videoHeight;


    // =========================================
    // CAPTURAR VIDEO
    // =========================================

    context.drawImage(
        video,
        0,
        0,
        videoWidth,
        videoHeight
    );


    // =========================================
    // CONVERTIR A IMAGEN
    // =========================================

    const fotoFinal =
        canvas.toDataURL(
            "image/jpeg",
            0.90
        );


    // =========================================
    // MOSTRAR FOTO
    // =========================================

    foto.src =
        fotoFinal;


    foto.style.display =
        "block";


    // =========================================
    // GUARDAR FOTO
    // =========================================

    foto.dataset.imagen =
        fotoFinal;


    // =========================================
    // GUARDAR EN INPUT
    // =========================================

    const fotoInput =
        document.getElementById("fotoInput");


    if (fotoInput) {

        fotoInput.value =
            fotoFinal;

    }


    // =========================================
    // DETENER CÁMARA
    // =========================================

    detenerCamara();


    // =========================================
    // ACTUALIZAR ESTADO
    // =========================================

    const status =
        document.getElementById("cameraStatus");


    const error =
        document.getElementById("cameraError");


    if (status) {

        status.textContent =
            "Foto tomada correctamente.";

    }


    if (error) {

        error.textContent = "";

    }

}


// =========================================================
// DETENER CÁMARA
// =========================================================

function detenerCamara() {

    if (streamCamara) {

        const tracks =
            streamCamara.getTracks();


        tracks.forEach(function (track) {

            track.stop();

        });


        streamCamara =
            null;

    }


    if (video) {

        try {

            video.pause();

        }
        catch (e) {

            console.warn(e);

        }


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


    // =========================================
    // RESTAURAR FOTO
    // =========================================

    if (foto) {

        foto.src =
            "img/default.jpg";


        foto.style.display =
            "block";


        foto.removeAttribute(
            "data-imagen"
        );

    }


    // =========================================
    // LIMPIAR INPUT
    // =========================================

    const fotoInput =
        document.getElementById("fotoInput");


    if (fotoInput) {

        fotoInput.value =
            "";

    }


    // =========================================
    // LIMPIAR CANVAS
    // =========================================

    if (canvas) {

        const context =
            canvas.getContext("2d");


        if (context) {

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }

    }


    // =========================================
    // DETENER CÁMARA
    // =========================================

    detenerCamara();


    // =========================================
    // ESTADO
    // =========================================

    const status =
        document.getElementById("cameraStatus");


    const error =
        document.getElementById("cameraError");


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
// DETENER CÁMARA AL CERRAR LA PÁGINA
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        detenerCamara();

    }
);
