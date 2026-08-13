// =============================================
// CAMARA DITS
// =============================================

let ditsCameraStream = null;


// =============================================
// INICIALIZAR
// =============================================

document.addEventListener("DOMContentLoaded", function () {

    const ditsVideo =
        document.getElementById("video");

    const ditsCanvas =
        document.getElementById("canvas");

    const ditsFoto =
        document.getElementById("foto");

    const ditsBtnAbrir =
        document.getElementById("abrirCamara");

    const ditsBtnFoto =
        document.getElementById("btntomarfoto");

    const ditsStatus =
        document.getElementById("cameraStatus");

    const ditsError =
        document.getElementById("cameraError");

    const ditsCameraMenu =
        document.getElementById("camera-menu");


    // =========================================
    // COMPROBAR ELEMENTOS
    // =========================================

    if (!ditsBtnAbrir) {

        console.error(
            "No se encontró el botón abrirCamara."
        );

        return;
    }


    if (!ditsVideo) {

        console.error(
            "No se encontró el elemento video."
        );

        return;
    }


    // =========================================
    // ABRIR CAMARA
    // =========================================

    ditsBtnAbrir.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            // -------------------------------------
            // CERRAR MENU PRINCIPAL
            // -------------------------------------

            const ditsSideMenu =
                document.getElementById("side-menu");

            const ditsSideMenuInstance =
                M.Sidenav.getInstance(
                    ditsSideMenu
                );


            if (ditsSideMenuInstance) {

                ditsSideMenuInstance.close();

            }


            // -------------------------------------
            // ABRIR MENU CAMARA
            // -------------------------------------

            const ditsCameraInstance =
                M.Sidenav.getInstance(
                    ditsCameraMenu
                );


            if (ditsCameraInstance) {

                ditsCameraInstance.open();

            }


            // -------------------------------------
            // INICIAR CAMARA
            // -------------------------------------

            ditsIniciarCamara(
                ditsVideo,
                ditsStatus,
                ditsError
            );

        }
    );


    // =========================================
    // TOMAR FOTO
    // =========================================

    if (ditsBtnFoto) {

        ditsBtnFoto.addEventListener(
            "click",
            function () {

                ditsTomarFoto(
                    ditsVideo,
                    ditsCanvas,
                    ditsFoto,
                    ditsStatus,
                    ditsError
                );

            }
        );

    }


    // =========================================
    // CERRAR CAMARA
    // =========================================

    if (ditsCameraMenu) {

        ditsCameraMenu.addEventListener(
            "sidenavClose",
            function () {

                ditsDetenerCamara(
                    ditsVideo
                );

            }
        );

    }

});


// =============================================
// INICIAR CAMARA
// =============================================

async function ditsIniciarCamara(
    ditsVideo,
    ditsStatus,
    ditsError
) {

    ditsStatus.textContent =
        "Comprobando cámara...";

    ditsError.textContent = "";


    // =========================================
    // COMPROBAR SOPORTE
    // =========================================

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        ditsStatus.textContent = "";

        ditsError.textContent =
            "Este navegador no permite acceder a la cámara.";

        return;
    }


    // =========================================
    // COMPROBAR SEGURIDAD
    // =========================================

    const ditsEsLocalhost =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

    const ditsEsHTTPS =
        location.protocol === "https:";


    if (
        !ditsEsLocalhost &&
        !ditsEsHTTPS
    ) {

        ditsStatus.textContent = "";

        ditsError.textContent =
            "La cámara necesita HTTPS o localhost.";

        return;
    }


    // =========================================
    // SI YA ESTA ABIERTA
    // =========================================

    if (ditsCameraStream) {

        ditsStatus.textContent =
            "Cámara activada.";

        return;
    }


    // =========================================
    // SOLICITAR CAMARA
    // =========================================

    try {

        ditsStatus.textContent =
            "Solicitando permiso para usar la cámara...";


        ditsCameraStream =
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


        // =====================================
        // CONECTAR STREAM CON VIDEO
        // =====================================

        ditsVideo.srcObject =
            ditsCameraStream;


        ditsVideo.style.display =
            "block";


        await ditsVideo.play();


        ditsStatus.textContent =
            "Cámara activada. Puedes tomar una foto.";

        ditsError.textContent = "";


    }

    catch (ditsErrorCamera) {

        console.error(
            "Error de cámara:",
            ditsErrorCamera
        );


        ditsStatus.textContent = "";


        // -------------------------------------
        // NO HAY CAMARA
        // -------------------------------------

        if (
            ditsErrorCamera.name ===
            "NotFoundError"
        ) {

            ditsError.textContent =
                "No se encontró ninguna cámara " +
                "en este dispositivo.";

            return;
        }


        // -------------------------------------
        // PERMISO DENEGADO
        // -------------------------------------

        if (
            ditsErrorCamera.name ===
            "NotAllowedError"
        ) {

            ditsError.textContent =
                "El acceso a la cámara fue bloqueado. " +
                "Permite la cámara en los permisos del navegador.";

            return;
        }


        // -------------------------------------
        // CAMARA OCUPADA
        // -------------------------------------

        if (
            ditsErrorCamera.name ===
            "NotReadableError"
        ) {

            ditsError.textContent =
                "La cámara está siendo utilizada " +
                "por otra aplicación.";

            return;
        }


        // -------------------------------------
        // ERROR DE SEGURIDAD
        // -------------------------------------

        if (
            ditsErrorCamera.name ===
            "SecurityError"
        ) {

            ditsError.textContent =
                "El navegador bloqueó el acceso a la cámara.";

            return;
        }


        // -------------------------------------
        // OTRO ERROR
        // -------------------------------------

        ditsError.textContent =
            "No se pudo acceder a la cámara: " +
            ditsErrorCamera.name;

    }

}


// =============================================
// TOMAR FOTO
// =============================================

function ditsTomarFoto(
    ditsVideo,
    ditsCanvas,
    ditsFoto,
    ditsStatus,
    ditsError
) {

    // =========================================
    // COMPROBAR CAMARA
    // =========================================

    if (!ditsCameraStream) {

        ditsError.textContent =
            "La cámara todavía no está disponible.";

        return;
    }


    // =========================================
    // COMPROBAR VIDEO
    // =========================================

    if (
        ditsVideo.videoWidth === 0 ||
        ditsVideo.videoHeight === 0
    ) {

        ditsError.textContent =
            "Espera a que la cámara termine de cargar.";

        return;
    }


    // =========================================
    // CONFIGURAR CANVAS
    // =========================================

    ditsCanvas.width =
        ditsVideo.videoWidth;

    ditsCanvas.height =
        ditsVideo.videoHeight;


    // =========================================
    // DIBUJAR FOTO
    // =========================================

    const ditsContext =
        ditsCanvas.getContext("2d");


    ditsContext.drawImage(
        ditsVideo,
        0,
        0,
        ditsCanvas.width,
        ditsCanvas.height
    );


    // =========================================
    // CREAR IMAGEN
    // =========================================

    const ditsImagen =
        ditsCanvas.toDataURL(
            "image/jpeg",
            0.85
        );


    // =========================================
    // MOSTRAR FOTO
    // =========================================

    ditsFoto.src =
        ditsImagen;

    ditsFoto.style.display =
        "block";


    ditsStatus.textContent =
        "Foto tomada correctamente.";

    ditsError.textContent = "";


    // =========================================
    // MOSTRAR EN CONSOLA
    // =========================================

    console.log(
        "Foto tomada correctamente."
    );

}


// =============================================
// DETENER CAMARA
// =============================================

function ditsDetenerCamara(
    ditsVideo
) {

    if (!ditsCameraStream) {

        return;
    }


    // =========================================
    // DETENER STREAM
    // =========================================

    ditsCameraStream
        .getTracks()
        .forEach(function (ditsTrack) {

            ditsTrack.stop();

        });


    // =========================================
    // LIMPIAR VIDEO
    // =========================================

    ditsVideo.srcObject =
        null;


    // =========================================
    // REINICIAR
    // =========================================

    ditsCameraStream =
        null;

}