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
    // DETENER CÁMARA AL CERRAR EL FORMULARIO
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


    option.value = id;

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
// OBTENER ELEMENTOS DE LA CÁMARA
// =========================================================

function prepararCamara() {

    /*
     * IMPORTANTE:
     * En tu index.html los IDs son:
     *
     * Video
     * Canvas
     * foto
     *
     * Por eso deben escribirse exactamente igual.
     */

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


    if (!video) {

        console.error(
            "No se encontró el elemento #Video"
        );

        return;

    }


    // =========================================
    // COMPROBAR SOPORTE DE CÁMARA
    // =========================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (error) {

            error.textContent =
                "La cámara no está disponible en este dispositivo.";

        }

        console.error(
            "getUserMedia no está disponible."
        );

        return;

    }


    try {

        // =========================================
        // DETENER STREAM ANTERIOR
        // =========================================

        if (streamCamara) {

            detenerCamara();

        }


        if (status) {

            status.textContent =
                "Iniciando cámara...";

        }


        // =========================================
        // SOLICITAR ACCESO A LA CÁMARA
        // =========================================

        streamCamara =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    }

                },

                audio: false

            });


        // =========================================
        // COLOCAR STREAM EN EL VIDEO
        // =========================================

        video.srcObject =
            streamCamara;


        // Esperar a que el navegador permita
        // reproducir el video.

        await video.play();


        // =========================================
        // CONFIGURAR DIMENSIONES
        // =========================================

        video.onloadedmetadata =
            function () {

                if (!streaming) {

                    height =
                        video.videoHeight /
                        (video.videoWidth / width);


                    if (
                        !height ||
                        !isFinite(height)
                    ) {

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

            };


        // =========================================
        // ESTADO
        // =========================================

        if (status) {

            status.textContent =
                "Cámara lista.";

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


        if (status) {

            status.textContent =
                "No se pudo iniciar la cámara.";

        }


        if (error) {

            error.textContent =
                "Verifica los permisos de cámara y que la página utilice HTTPS.";

        }

    }

}


// =========================================================
// TOMAR FOTO
// =========================================================

function tomarFoto() {

    prepararCamara();


    if (!video || !canvas || !foto) {

        console.error(
            "No se encontraron los elementos necesarios para tomar la foto."
        );

        return;

    }


    // =========================================
    // OBTENER CONTEXTO DEL CANVAS
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
    // COMPROBAR DIMENSIONES
    // =========================================

    if (!streaming) {

        if (video.videoWidth > 0) {

            width = 320;

            height =
                video.videoHeight /
                (video.videoWidth / width);

        }
        else {

            height = 240;

        }

    }


    // =========================================
    // CONFIGURAR CANVAS
    // =========================================

    canvas.width =
        width;

    canvas.height =
        height;


    // =========================================
    // COPIAR VIDEO AL CANVAS
    // =========================================

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    // =========================================
    // CONVERTIR A IMAGEN
    // =========================================

    const fotoFinal =
        canvas.toDataURL("image/png");


    // =========================================
    // MOSTRAR FOTO
    // =========================================

    foto.setAttribute(
        "src",
        fotoFinal
    );


    foto.style.display =
        "block";


    // =========================================
    // GUARDAR FOTO
    // =========================================

    foto.dataset.imagen =
        fotoFinal;


    // =========================================
    // GUARDAR TAMBIÉN EN FOTO INPUT
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

        const tracks =
            streamCamara.getTracks();


        tracks.forEach(function (track) {

            track.stop();

        });


        streamCamara = null;

    }


    if (video) {

        video.srcObject =
            null;

    }


    streaming = false;

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

        foto.removeAttribute(
            "data-imagen"
        );

    }


    // =========================================
    // LIMPIAR INPUT OCULTO
    // =========================================

    const fotoInput =
        document.getElementById("fotoInput");

    if (fotoInput) {

        fotoInput.value = "";

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
    // ACTUALIZAR ESTADO
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

        error.textContent = "";

    }

}


// =========================================================
// CERRAR CÁMARA AL SALIR
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        detenerCamara();

    }
);
