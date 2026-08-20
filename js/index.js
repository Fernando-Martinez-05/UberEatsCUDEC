// =========================================================
// DITS - INDEX.JS
// Gestión de platillos + cámara del dispositivo
// =========================================================


// =========================================================
// VARIABLES GENERALES
// =========================================================

let contenido = "";


// =========================================================
// VARIABLES DE LA CÁMARA
// =========================================================

let streaming = false;

let width = 640;

let height = 0;

let video = null;

let canvas = null;

let foto = null;

let streamCamara = null;


// =========================================================
// INICIALIZAR MATERIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚS LATERALES
    // =====================================================

    const menus = document.querySelectorAll(".sidenav");

    if (typeof M !== "undefined") {

        M.Sidenav.init(menus, {
            edge: "right"
        });

    }


    // =====================================================
    // SELECTS
    // =====================================================

    const selects = document.querySelectorAll("select");

    if (typeof M !== "undefined") {

        M.FormSelect.init(selects);

    }


    // =====================================================
    // BOTÓN USAR CÁMARA
    // =====================================================

    const btnCamara =
        document.getElementById("btnCamara");

    if (btnCamara) {

        btnCamara.addEventListener("click", function (event) {

            event.preventDefault();

            iniciarCamara();

        });

    }


    // =====================================================
    // BOTÓN CAPTURAR
    // =====================================================

    const btnCapturar =
        document.getElementById("btnCapturar");

    if (btnCapturar) {

        btnCapturar.addEventListener("click", function (event) {

            event.preventDefault();

            tomarFoto();

        });

    }


    // =====================================================
    // BOTÓN LIMPIAR
    // =====================================================

    const btnLimpiar =
        document.getElementById("btnLimpiar");

    if (btnLimpiar) {

        btnLimpiar.addEventListener("click", function (event) {

            event.preventDefault();

            limpiarFoto();

        });

    }


    // =====================================================
    // SELECCIONAR IMAGEN DESDE GALERÍA
    // =====================================================

    const btnFoto =
        document.getElementById("btnFoto");

    if (btnFoto) {

        btnFoto.addEventListener("change", function () {

            cargarImagenSeleccionada(this);

        });

    }


    // =====================================================
    // DETENER CÁMARA AL CERRAR EL FORMULARIO
    // =====================================================

    const sideForm =
        document.getElementById("side-form");

    if (sideForm) {

        sideForm.addEventListener(
            "sidenav:close",
            function () {

                detenerCamara();

            }
        );

    }


    // =====================================================
    // FORMULARIO
    // =====================================================

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
// PREPARAR ELEMENTOS DE LA CÁMARA
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


    // =====================================================
    // COMPROBAR VIDEO
    // =====================================================

    if (!video) {

        console.error(
            "No se encontró el elemento #Video."
        );

        if (error) {

            error.textContent =
                "No se encontró el elemento de video.";

        }

        return;

    }


    // =====================================================
    // COMPROBAR SOPORTE
    // =====================================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (error) {

            error.textContent =
                "Tu navegador no permite utilizar la cámara.";

        }

        console.error(
            "getUserMedia no está disponible."
        );

        return;

    }


    // =====================================================
    // COMPROBAR HTTPS
    // =====================================================

    if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {

        console.warn(
            "La cámara normalmente requiere HTTPS."
        );

    }


    try {

        // =================================================
        // DETENER STREAM ANTERIOR
        // =================================================

        detenerCamara();


        if (status) {

            status.textContent =
                "Solicitando acceso a la cámara...";

        }


        // =================================================
        // SOLICITAR CÁMARA TRASERA
        // =================================================

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


        // =================================================
        // ASIGNAR STREAM
        // =================================================

        video.srcObject =
            streamCamara;


        video.setAttribute(
            "autoplay",
            ""
        );


        video.setAttribute(
            "playsinline",
            ""
        );


        video.muted = true;


        // =================================================
        // REPRODUCIR VIDEO
        // =================================================

        try {

            await video.play();

        }
        catch (playError) {

            console.warn(
                "El navegador bloqueó la reproducción automática.",
                playError
            );

        }


        // =================================================
        // ESPERAR METADATA
        // =================================================

        video.onloadedmetadata =
            function () {

                configurarVideo();

            };


        // =================================================
        // POR SI LA METADATA YA ESTÁ CARGADA
        // =================================================

        if (video.readyState >= 2) {

            configurarVideo();

        }


        if (status) {

            status.textContent =
                "Cámara lista. Puedes capturar la foto.";

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

            if (err.name === "NotAllowedError") {

                error.textContent =
                    "Permiso de cámara rechazado. Permite el acceso a la cámara en tu navegador.";

            }
            else if (err.name === "NotFoundError") {

                error.textContent =
                    "No se encontró ninguna cámara en el dispositivo.";

            }
            else if (err.name === "NotReadableError") {

                error.textContent =
                    "La cámara está siendo utilizada por otra aplicación.";

            }
            else if (err.name === "SecurityError") {

                error.textContent =
                    "El navegador bloqueó la cámara por motivos de seguridad. Utiliza HTTPS.";

            }
            else {

                error.textContent =
                    "No se pudo acceder a la cámara. Revisa los permisos del dispositivo.";

            }

        }

    }

}


// =========================================================
// CONFIGURAR VIDEO
// =========================================================

function configurarVideo() {

    prepararCamara();


    if (!video) {
        return;
    }


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        return;

    }


    // =====================================================
    // CALCULAR DIMENSIONES
    // =====================================================

    width = 640;


    height =
        video.videoHeight /
        (video.videoWidth / width);


    if (
        !height ||
        !isFinite(height)
    ) {

        height = 360;

    }


    // =====================================================
    // LIMITAR TAMAÑO
    // =====================================================

    if (height > 480) {

        height = 480;

    }


    // =====================================================
    // CONFIGURAR CANVAS
    // =====================================================

    if (canvas) {

        canvas.width =
            width;

        canvas.height =
            height;

    }


    streaming = true;

}


// =========================================================
// TOMAR FOTO
// =========================================================

function tomarFoto() {

    prepararCamara();


    if (!video) {

        console.error(
            "No se encontró #Video."
        );

        return;

    }


    if (!canvas) {

        console.error(
            "No se encontró #Canvas."
        );

        return;

    }


    if (!foto) {

        console.error(
            "No se encontró #foto."
        );

        return;

    }


    // =====================================================
    // COMPROBAR CÁMARA
    // =====================================================

    if (
        !streamCamara ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        mostrarErrorCamara(
            "Primero debes abrir la cámara."
        );

        return;

    }


    // =====================================================
    // CONTEXTO
    // =====================================================

    const context =
        canvas.getContext("2d");


    if (!context) {

        console.error(
            "No se pudo obtener el contexto del canvas."
        );

        return;

    }


    // =====================================================
    // DIMENSIONES REALES
    // =====================================================

    const videoWidth =
        video.videoWidth;

    const videoHeight =
        video.videoHeight;


    // =====================================================
    // UTILIZAR RESOLUCIÓN DEL VIDEO
    // =====================================================

    canvas.width =
        videoWidth;

    canvas.height =
        videoHeight;


    // =====================================================
    // DIBUJAR VIDEO
    // =====================================================

    context.drawImage(
        video,
        0,
        0,
        videoWidth,
        videoHeight
    );


    // =====================================================
    // CONVERTIR A JPEG
    // =====================================================

    const fotoFinal =
        canvas.toDataURL(
            "image/jpeg",
            0.90
        );


    // =====================================================
    // MOSTRAR FOTO
    // =====================================================

    foto.src =
        fotoFinal;


    foto.style.display =
        "block";


    // =====================================================
    // GUARDAR IMAGEN
    // =====================================================

    foto.dataset.imagen =
        fotoFinal;


    // =====================================================
    // GUARDAR EN INPUT
    // =====================================================

    const fotoInput =
        document.getElementById("fotoInput");


    if (fotoInput) {

        fotoInput.value =
            fotoFinal;

    }


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerCamara();


    // =====================================================
    // ESTADO
    // =====================================================

    const status =
        document.getElementById("cameraStatus");


    if (status) {

        status.textContent =
            "Foto tomada correctamente.";

    }


    const error =
        document.getElementById("cameraError");


    if (error) {

        error.textContent = "";

    }

}


// =========================================================
// SELECCIONAR IMAGEN DESDE GALERÍA
// =========================================================

function cargarImagenSeleccionada(input) {

    if (
        !input ||
        !input.files ||
        input.files.length === 0
    ) {

        return;

    }


    const archivo =
        input.files[0];


    // =====================================================
    // COMPROBAR TIPO
    // =====================================================

    if (!archivo.type.startsWith("image/")) {

        mostrarErrorCamara(
            "Selecciona un archivo de imagen válido."
        );

        input.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            prepararCamara();


            if (!foto) {
                return;
            }


            const imagen =
                event.target.result;


            // =============================================
            // MOSTRAR FOTO
            // =============================================

            foto.src =
                imagen;


            foto.style.display =
                "block";


            foto.dataset.imagen =
                imagen;


            // =============================================
            // GUARDAR INPUT OCULTO
            // =============================================

            const fotoInput =
                document.getElementById("fotoInput");


            if (fotoInput) {

                fotoInput.value =
                    imagen;

            }


            // =============================================
            // DETENER CÁMARA
            // =============================================

            detenerCamara();


            // =============================================
            // ESTADO
            // =============================================

            const status =
                document.getElementById(
                    "cameraStatus"
                );


            if (status) {

                status.textContent =
                    "Imagen seleccionada correctamente.";

            }


            const error =
                document.getElementById(
                    "cameraError"
                );


            if (error) {

                error.textContent = "";

            }

        };


    reader.readAsDataURL(archivo);

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

        video.pause();

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


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerCamara();


    // =====================================================
    // LIMPIAR FOTO
    // =====================================================

    if (foto) {

        foto.src =
            "img/default.jpg";

        foto.style.display =
            "block";


        foto.removeAttribute(
            "data-imagen"
        );

    }


    // =====================================================
    // LIMPIAR INPUT OCULTO
    // =====================================================

    const fotoInput =
        document.getElementById("fotoInput");


    if (fotoInput) {

        fotoInput.value = "";

    }


    // =====================================================
    // LIMPIAR INPUT DE GALERÍA
    // =====================================================

    const btnFoto =
        document.getElementById("btnFoto");


    if (btnFoto) {

        btnFoto.value = "";

    }


    // =====================================================
    // LIMPIAR CANVAS
    // =====================================================

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


    // =====================================================
    // ESTADO
    // =====================================================

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

        error.textContent = "";

    }

}


// =========================================================
// MOSTRAR ERROR
// =========================================================

function mostrarErrorCamara(mensaje) {

    const error =
        document.getElementById(
            "cameraError"
        );


    if (error) {

        error.textContent =
            mensaje;

    }


    console.error(
        mensaje
    );

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


// =========================================================
// DETENER CÁMARA CUANDO LA PÁGINA PASA A SEGUNDO PLANO
// =========================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.hidden) {

            detenerCamara();

        }

    }
);
