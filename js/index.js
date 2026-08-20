// =========================================================
// DITS - INDEX.JS
// Gestión de platillos + cámara + fotografías
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

let contenido = "";

let streaming = false;

let width = 420;
let height = 0;


// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MENÚ LATERAL
    // =====================================================

    const menus = document.querySelectorAll(".side-menu");

    if (menus.length > 0) {
        M.Sidenav.init(menus, {
            edge: "right"
        });
    }


    // =====================================================
    // FORMULARIO LATERAL
    // =====================================================

    const forms = document.querySelectorAll(".side-form");

    if (forms.length > 0) {
        M.Sidenav.init(forms, {
            edge: "left"
        });
    }


    // =====================================================
    // ELEMENTOS DE CÁMARA
    // =====================================================

    const video = document.getElementById("Video");
    const canvas = document.getElementById("Canvas");
    const foto = document.getElementById("foto");

    const btnFoto = document.getElementById("btnFoto");
    const btnCamara = document.getElementById("btnCamara");
    const btnCapturar = document.getElementById("btnCapturar");
    const btnLimpiar = document.getElementById("btnLimpiar");

    const cameraStatus = document.getElementById("cameraStatus");
    const cameraError = document.getElementById("cameraError");


    // =====================================================
    // SELECCIONAR IMAGEN DESDE GALERÍA
    // =====================================================

    if (btnFoto) {

        btnFoto.addEventListener("change", function (event) {

            const file = event.target.files[0];

            if (!file) {

                foto.src = "img/default.jpg";

                document.getElementById("fotoInput").value = "";

                return;
            }


            // Verificar que sea una imagen

            if (!file.type.startsWith("image/")) {

                alert("Selecciona un archivo de imagen válido.");

                btnFoto.value = "";

                return;
            }


            const reader = new FileReader();


            reader.onload = function (e) {

                const fotoFinal = e.target.result;


                // Mostrar imagen

                foto.src = fotoFinal;


                // Guardar Base64

                document.getElementById("fotoInput").value = fotoFinal;


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Imagen seleccionada correctamente.";

                }


                if (cameraError) {

                    cameraError.textContent = "";

                }

            };


            reader.onerror = function () {

                if (cameraError) {

                    cameraError.textContent =
                        "No se pudo leer la imagen.";

                }

            };


            reader.readAsDataURL(file);

        });

    }


    // =====================================================
    // CONFIGURAR VIDEO
    // =====================================================

    if (video) {

        video.addEventListener("canplay", function () {

            if (!streaming) {

                if (video.videoWidth === 0 || video.videoHeight === 0) {
                    return;
                }


                height =
                    video.videoHeight /
                    (video.videoWidth / width);


                video.setAttribute("width", width);

                video.setAttribute("height", height);


                canvas.setAttribute("width", width);

                canvas.setAttribute("height", height);


                streaming = true;


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara activa. Puedes tomar la fotografía.";

                }

            }

        });

    }


    // =====================================================
    // BOTÓN USAR CÁMARA
    // =====================================================

    if (btnCamara) {

        btnCamara.addEventListener("click", async function (e) {

            e.preventDefault();


            if (!navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia) {

                mostrarError(
                    "Tu navegador no permite acceder a la cámara.",
                    cameraError
                );

                return;
            }


            try {

                // Detener cámara anterior si existe

                detenerCamara();


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Solicitando acceso a la cámara...";

                }


                if (cameraError) {

                    cameraError.textContent = "";

                }


                // =================================================
                // CÁMARA TRASERA
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


                video.srcObject = stream;


                // Reiniciar estado

                streaming = false;


                // Mostrar cámara

                document.getElementById("Camera").style.display =
                    "block";


                // Reproducir video

                await video.play();


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara activa. Apunta al platillo y presiona Capturar.";

                }


            } catch (error) {

                console.error(
                    "Error al acceder a la cámara:",
                    error
                );


                let mensaje =
                    "No se pudo abrir la cámara.";


                if (error.name === "NotAllowedError") {

                    mensaje =
                        "Permiso de cámara denegado. " +
                        "Permite el acceso a la cámara en tu navegador.";

                }


                else if (error.name === "NotFoundError") {

                    mensaje =
                        "No se encontró ninguna cámara en el dispositivo.";

                }


                else if (error.name === "NotReadableError") {

                    mensaje =
                        "La cámara está siendo utilizada por otra aplicación.";

                }


                else if (error.name === "SecurityError") {

                    mensaje =
                        "El navegador bloqueó la cámara. " +
                        "Utiliza HTTPS.";

                }


                mostrarError(mensaje, cameraError);


                if (cameraStatus) {

                    cameraStatus.textContent =
                        "Cámara no disponible.";

                }

            }

        });

    }


    // =====================================================
    // BOTÓN CAPTURAR
    // =====================================================

    if (btnCapturar) {

        btnCapturar.addEventListener("click", function (e) {

            e.preventDefault();

            tomarFoto();

        });

    }


    // =====================================================
    // BOTÓN LIMPIAR
    // =====================================================

    if (btnLimpiar) {

        btnLimpiar.addEventListener("click", function (e) {

            e.preventDefault();

            limpiarFoto();

        });

    }


    // =====================================================
    // LIMPIAR AL CERRAR EL FORMULARIO
    // =====================================================

    const sideForm =
        document.getElementById("side-form");


    if (sideForm) {

        sideForm.addEventListener("sidenav:closed", function () {

            // No detenemos automáticamente la cámara
            // para evitar comportamientos inesperados.

        });

    }

});


// =========================================================
// MOSTRAR PLATILLO
// Esta función es utilizada por db.js
// =========================================================

function mostrarPlatillo(platillo, id) {

    let fotoPlatillo = "";


    // =====================================================
    // FOTO
    // =====================================================

    if (
        platillo.foto &&
        platillo.foto.trim() !== ""
    ) {

        fotoPlatillo = platillo.foto;

    } else {

        fotoPlatillo = "img/default.jpg";

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

            <div class="recipe-image">

                <img
                    src="${fotoPlatillo}"
                    alt="${escapeHTML(platillo.nombre || "Platillo")}"
                    width="100"
                    height="100"
                    onerror="this.src='img/default.jpg'"
                >

            </div>


            <div class="recipe-details">

                <div class="recipe-title">

                    ${escapeHTML(platillo.nombre || "Sin nombre")}

                </div>


                <div class="recipe-ingredients">

                    ${escapeHTML(
                        platillo.ingredientes ||
                        "Sin ingredientes"
                    )}

                </div>


                <div class="recipe-price">

                    $${formatearPrecio(platillo.precio)} MXN

                </div>


                <div class="recipe-delete">

                    <i
                        class="material-icons"
                        data-id="${id}"
                        title="Eliminar platillo"
                    >

                        delete_outline

                    </i>

                </div>

            </div>

        </div>

    `;


    const contenedor =
        document.querySelector(".recipes");


    if (contenedor) {

        contenedor.innerHTML += contenido;

    }

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


    const imagen =
        tarjeta.querySelector(".recipe-image img");


    if (titulo) {

        titulo.textContent =
            platillo.nombre || "Sin nombre";

    }


    if (ingredientes) {

        ingredientes.textContent =
            platillo.ingredientes || "Sin ingredientes";

    }


    if (precio) {

        precio.textContent =
            `$${formatearPrecio(platillo.precio)} MXN`;

    }


    if (imagen) {

        if (platillo.foto) {

            imagen.src = platillo.foto;

        } else {

            imagen.src = "img/default.jpg";

        }

    }

}


// =========================================================
// BORRAR PLATILLO
// Esta función es utilizada por db.js
// =========================================================

function borrarPlatillo(id) {

    const platillo =
        document.querySelector(
            `.recipe[data-id="${id}"]`
        );


    if (platillo) {

        platillo.remove();

    }

}


// =========================================================
// TOMAR FOTO
// =========================================================

function tomarFoto() {

    const video =
        document.getElementById("Video");


    const canvas =
        document.getElementById("Canvas");


    const foto =
        document.getElementById("foto");


    const fotoInput =
        document.getElementById("fotoInput");


    const cameraStatus =
        document.getElementById("cameraStatus");


    const cameraError =
        document.getElementById("cameraError");


    if (!video || !canvas || !foto) {

        return;

    }


    // Verificar que exista cámara activa

    if (!video.srcObject) {

        mostrarError(
            "Primero presiona 'Usar cámara'.",
            cameraError
        );

        return;

    }


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        mostrarError(
            "La cámara todavía no está lista. Espera unos segundos.",
            cameraError
        );

        return;

    }


    // =====================================================
    // CALCULAR DIMENSIONES
    // =====================================================

    width = 420;


    height =
        video.videoHeight /
        (video.videoWidth / width);


    canvas.width = width;

    canvas.height = height;


    // =====================================================
    // DIBUJAR VIDEO EN CANVAS
    // =====================================================

    const context =
        canvas.getContext("2d");


    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    // =====================================================
    // CONVERTIR A BASE64
    // =====================================================

    const fotoFinal =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );


    // =====================================================
    // MOSTRAR FOTO
    // =====================================================

    foto.src = fotoFinal;


    // =====================================================
    // GUARDAR FOTO EN INPUT
    // =====================================================

    if (fotoInput) {

        fotoInput.value = fotoFinal;

    }


    // =====================================================
    // OCULTAR CÁMARA
    // =====================================================

    const cameraContainer =
        document.getElementById("Camera");


    if (cameraContainer) {

        cameraContainer.style.display =
            "none";

    }


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerCamara();


    // =====================================================
    // MENSAJES
    // =====================================================

    if (cameraStatus) {

        cameraStatus.textContent =
            "Fotografía capturada correctamente.";

    }


    if (cameraError) {

        cameraError.textContent = "";

    }

}


// =========================================================
// LIMPIAR FOTO
// =========================================================

function limpiarFoto() {

    const video =
        document.getElementById("Video");


    const foto =
        document.getElementById("foto");


    const fotoInput =
        document.getElementById("fotoInput");


    const btnFoto =
        document.getElementById("btnFoto");


    const cameraContainer =
        document.getElementById("Camera");


    const cameraStatus =
        document.getElementById("cameraStatus");


    const cameraError =
        document.getElementById("cameraError");


    // =====================================================
    // DETENER CÁMARA
    // =====================================================

    detenerCamara();


    // =====================================================
    // RESTAURAR IMAGEN
    // =====================================================

    if (foto) {

        foto.src = "img/default.jpg";

    }


    // =====================================================
    // LIMPIAR INPUT
    // =====================================================

    if (fotoInput) {

        fotoInput.value = "";

    }


    if (btnFoto) {

        btnFoto.value = "";

    }


    // =====================================================
    // MOSTRAR CÁMARA NUEVAMENTE
    // =====================================================

    if (cameraContainer) {

        cameraContainer.style.display =
            "block";

    }


    // =====================================================
    // MENSAJES
    // =====================================================

    if (cameraStatus) {

        cameraStatus.textContent =
            "Foto limpiada. Cámara lista para usar.";

    }


    if (cameraError) {

        cameraError.textContent = "";

    }

}


// =========================================================
// DETENER CÁMARA
// =========================================================

function detenerCamara() {

    const video =
        document.getElementById("Video");


    if (!video) {

        return;

    }


    if (video.srcObject) {

        const tracks =
            video.srcObject.getTracks();


        tracks.forEach(function (track) {

            track.stop();

        });


        video.srcObject = null;

    }


    video.pause();


    streaming = false;

}


// =========================================================
// MOSTRAR ERROR
// =========================================================

function mostrarError(mensaje, elemento) {

    if (elemento) {

        elemento.textContent = mensaje;

    } else {

        alert(mensaje);

    }

}


// =========================================================
// FORMATEAR PRECIO
// =========================================================

function formatearPrecio(precio) {

    const numero =
        parseFloat(precio);


    if (isNaN(numero)) {

        return "0.00";

    }


    return numero.toFixed(2);

}


// =========================================================
// PROTEGER TEXTO HTML
// Evita que nombres/ingredientes con HTML
// rompan la tarjeta
// =========================================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent =
        texto;


    return div.innerHTML;

}
