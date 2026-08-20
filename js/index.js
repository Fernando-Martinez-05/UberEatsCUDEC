// =====================================================
// DITS - INDEX.JS
// Gestión de platillos + cámara
// =====================================================


// =====================================================
// VARIABLES
// =====================================================

let contenido = "";

let streaming = false;

let width = 320;

let height = 0;


// =====================================================
// INICIO
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------------------------
    // MENÚ LATERAL
    // -------------------------------------------------

    const menus = document.querySelectorAll(".side-menu");

    if (menus.length > 0) {
        M.Sidenav.init(menus, {
            edge: "right"
        });
    }


    // -------------------------------------------------
    // FORMULARIO LATERAL
    // -------------------------------------------------

    const forms = document.querySelectorAll(".side-form");

    if (forms.length > 0) {
        M.Sidenav.init(forms, {
            edge: "left"
        });
    }


    // -------------------------------------------------
    // ELEMENTOS DE LA CÁMARA
    // -------------------------------------------------

    inicializarCamara();


    // -------------------------------------------------
    // FORMULARIO DE PLATILLO
    // -------------------------------------------------

    inicializarFormulario();


    // -------------------------------------------------
    // ELIMINAR PLATILLOS
    // -------------------------------------------------

    inicializarEliminacion();

});


// =====================================================
// MOSTRAR PLATILLO
// =====================================================

function mostrarPlatillo(platillo, id) {

    let fotoPlatillo = "";

    // Si tiene fotografía guardada
    if (platillo.foto && platillo.foto.trim() !== "") {

        fotoPlatillo = platillo.foto;

    } else {

        // Imagen por defecto
        fotoPlatillo = "img/default.jpg";

    }


    const tarjeta = `
    
        <div 
            class="card-panel recipe white row"
            id="${id}"
            data-id="${id}"
        >

            <img
                src="${fotoPlatillo}"
                height="100px"
                width="100px"
                alt="${platillo.nombre || "Platillo"}"
                onerror="this.src='img/default.jpg';"
            >

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


    const contenedor = document.querySelector(".recipes");

    if (contenedor) {

        contenedor.innerHTML += tarjeta;

    }

}


// =====================================================
// ACTUALIZAR PLATILLO
// =====================================================

function actualizarPlatillo(platillo, id) {

    const tarjeta = document.getElementById(id);

    if (!tarjeta) {
        return;
    }


    const titulo = tarjeta.querySelector(".recipe-title");

    const ingredientes = tarjeta.querySelector(".recipe-ingredients");

    const precio = tarjeta.querySelector(".recipe-price");


    if (titulo) {

        titulo.innerHTML = platillo.nombre || "Sin nombre";

    }


    if (ingredientes) {

        ingredientes.innerHTML =
            platillo.ingredientes || "Sin ingredientes";

    }


    if (precio) {

        precio.innerHTML =
            `$${platillo.precio || "0"} MXN`;

    }

}


// =====================================================
// BORRAR PLATILLO DE LA INTERFAZ
// =====================================================

function borrarPlatillo(id) {

    const platillo =
        document.querySelector(`.recipe[data-id="${id}"]`);


    if (platillo) {

        platillo.remove();

    }

}


// =====================================================
// AGREGAR A LISTA
// =====================================================
//
// Esta función es importante porque tu db.js la utiliza.
// Si db.js encuentra un platillo, llama a:
// agregarALista(...)
//
// =====================================================

function agregarALista(platillo, id) {

    // Actualmente el index principal muestra
    // los platillos mediante tarjetas.
    //
    // Esta función se mantiene para evitar el error:
    //
    // "agregarALista is not defined"
    //
    // También permite que, si posteriormente agregas
    // un select de platillos al index, funcione.

    const lista = document.getElementById("listaPlatillos");

    if (!lista) {
        return;
    }


    // Evitar duplicados

    if (lista.querySelector(`option[value="${id}"]`)) {
        return;
    }


    const opcion = document.createElement("option");

    opcion.value = id;

    opcion.textContent =
        platillo.nombre || "Platillo sin nombre";


    lista.appendChild(opcion);

}


// =====================================================
// FORMULARIO PARA AGREGAR PLATILLO
// =====================================================

function inicializarFormulario() {

    const formulario =
        document.querySelector(".add-recipe");


    if (!formulario) {
        return;
    }


    formulario.addEventListener("submit", function (e) {

        e.preventDefault();


        // ---------------------------------------------
        // OBTENER DATOS
        // ---------------------------------------------

        const nombre =
            document.getElementById("title").value.trim();


        const ingredientes =
            document.getElementById("ingredients").value.trim();


        const precio =
            document.getElementById("price").value;


        const foto =
            document.getElementById("fotoInput").value;


        // ---------------------------------------------
        // VALIDACIÓN
        // ---------------------------------------------

        if (
            nombre === "" ||
            ingredientes === "" ||
            precio === ""
        ) {

            alert("Por favor completa todos los campos.");

            return;

        }


        // ---------------------------------------------
        // OBJETO DEL PLATILLO
        // ---------------------------------------------

        const platilloNuevo = {

            nombre: nombre,

            ingredientes: ingredientes,

            precio: precio,

            foto: foto || ""

        };


        // ---------------------------------------------
        // GUARDAR EN FIREBASE
        // ---------------------------------------------

        db.collection("platillos")
            .add(platilloNuevo)

            .then(function () {

                alert("Platillo agregado correctamente.");


                // Limpiar formulario

                formulario.reset();


                // Limpiar fotografía

                const fotoInput =
                    document.getElementById("fotoInput");


                if (fotoInput) {

                    fotoInput.value = "";

                }


                const imagen =
                    document.getElementById("foto");


                if (imagen) {

                    imagen.src = "";

                }


                // Detener cámara

                detenerCamara();


                // Cerrar menú lateral

                const sideForm =
                    document.getElementById("side-form");


                if (sideForm) {

                    const instancia =
                        M.Sidenav.getInstance(sideForm);


                    if (instancia) {

                        instancia.close();

                    }

                }

            })

            .catch(function (error) {

                console.error(
                    "Error al agregar el platillo:",
                    error
                );


                alert(
                    "Error al agregar el platillo."
                );

            });

    });

}


// =====================================================
// ELIMINAR PLATILLO
// =====================================================

function inicializarEliminacion() {

    const contenedor =
        document.querySelector(".recipes");


    if (!contenedor) {
        return;
    }


    contenedor.addEventListener("click", function (e) {

        // Buscar si se hizo clic sobre el icono
        // o sobre alguno de sus elementos internos

        const icono =
            e.target.closest(".recipe-delete i");


        if (!icono) {
            return;
        }


        const id =
            icono.getAttribute("data-id");


        if (!id) {
            return;
        }


        const confirmar =
            confirm(
                "¿Seguro que deseas eliminar este platillo?"
            );


        if (!confirmar) {
            return;
        }


        db.collection("platillos")
            .doc(id)
            .delete()

            .then(function () {

                alert(
                    "Platillo eliminado correctamente."
                );

            })

            .catch(function (error) {

                console.error(
                    "Error al eliminar:",
                    error
                );


                alert(
                    "Error al eliminar el platillo."
                );

            });

    });

}


// =====================================================
// INICIALIZAR CÁMARA
// =====================================================

function inicializarCamara() {

    const video =
        document.getElementById("Video");


    const canvas =
        document.getElementById("Canvas");


    const foto =
        document.getElementById("foto");


    const btnFoto =
        document.getElementById("btnFoto");


    const btnCapturar =
        document.getElementById("btnCapturar");


    const btnLimpiar =
        document.getElementById("btnLimpiar");


    const btnCamara =
        document.getElementById("btnCamara");


    // Si no existen los elementos,
    // simplemente no hacemos nada.

    if (
        !video ||
        !canvas ||
        !foto
    ) {

        return;

    }


    // =================================================
    // SELECCIONAR IMAGEN DESDE GALERÍA
    // =================================================

    if (btnFoto) {

        btnFoto.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files[0];


                if (!file) {
                    return;
                }


                // Verificar que sea una imagen

                if (!file.type.startsWith("image/")) {

                    alert(
                        "Selecciona un archivo de imagen."
                    );

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (e) {

                        const fotoFinal =
                            e.target.result;


                        foto.src =
                            fotoFinal;


                        const fotoInput =
                            document.getElementById(
                                "fotoInput"
                            );


                        if (fotoInput) {

                            fotoInput.value =
                                fotoFinal;

                        }


                        // Detener cámara si estaba activa

                        detenerCamara();

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    // =================================================
    // CUANDO EL VIDEO ESTÉ LISTO
    // =================================================

    video.addEventListener(
        "canplay",
        function () {

            if (streaming) {
                return;
            }


            if (
                video.videoWidth === 0 ||
                video.videoHeight === 0
            ) {

                return;

            }


            height =
                video.videoHeight /
                (video.videoWidth / width);


            video.setAttribute(
                "width",
                width
            );


            video.setAttribute(
                "height",
                height
            );


            canvas.setAttribute(
                "width",
                width
            );


            canvas.setAttribute(
                "height",
                height
            );


            streaming = true;


            cambiarEstadoCamara(
                "Cámara activa. Puedes tomar la fotografía."
            );

        }
    );


    // =================================================
    // BOTÓN USAR CÁMARA
    // =================================================

    if (btnCamara) {

        btnCamara.addEventListener(
            "click",
            async function (e) {

                e.preventDefault();


                await iniciarCamara();

            }
        );

    }


    // =================================================
    // BOTÓN CAPTURAR
    // =================================================

    if (btnCapturar) {

        btnCapturar.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                tomarFoto();

            }
        );

    }


    // =================================================
    // BOTÓN LIMPIAR
    // =================================================

    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                limpiarFoto();

            }
        );

    }

}


// =====================================================
// INICIAR CÁMARA
// =====================================================

async function iniciarCamara() {

    const video =
        document.getElementById("Video");


    const cameraContainer =
        document.getElementById("Camera");


    const errorElemento =
        document.getElementById("cameraError");


    if (!video) {
        return;
    }


    // Limpiar error anterior

    if (errorElemento) {

        errorElemento.textContent = "";

    }


    // Verificar soporte

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        mostrarErrorCamara(
            "Tu navegador no permite utilizar la cámara."
        );

        return;

    }


    // Detener cámara anterior

    detenerCamara();


    try {

        cambiarEstadoCamara(
            "Solicitando acceso a la cámara..."
        );


        // Cámara trasera en teléfonos

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


        video.srcObject =
            stream;


        if (cameraContainer) {

            cameraContainer.style.display =
                "block";

        }


        video.muted = true;

        video.playsInline = true;


        await video.play();


        cambiarEstadoCamara(
            "Cámara activa."
        );


    } catch (error) {

        console.error(
            "Error al abrir la cámara:",
            error
        );


        let mensaje =
            "No se pudo abrir la cámara.";


        if (error.name === "NotAllowedError") {

            mensaje =
                "Permiso de cámara denegado. Autoriza el acceso a la cámara en tu navegador.";

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
                "La cámara requiere HTTPS para funcionar.";

        }


        mostrarErrorCamara(mensaje);

    }

}


// =====================================================
// TOMAR FOTO
// =====================================================

function tomarFoto() {

    const video =
        document.getElementById("Video");


    const canvas =
        document.getElementById("Canvas");


    const foto =
        document.getElementById("foto");


    const fotoInput =
        document.getElementById("fotoInput");


    if (
        !video ||
        !canvas ||
        !foto ||
        !fotoInput
    ) {

        return;

    }


    // Verificar que la cámara esté activa

    if (
        !video.srcObject ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        alert(
            "Primero debes activar la cámara."
        );

        return;

    }


    // Usar resolución real del video

    const ancho =
        video.videoWidth;


    const alto =
        video.videoHeight;


    canvas.width =
        ancho;


    canvas.height =
        alto;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        video,
        0,
        0,
        ancho,
        alto
    );


    // Convertir imagen a Base64

    const fotoFinal =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );


    // Mostrar fotografía

    foto.src =
        fotoFinal;


    // Guardar fotografía

    fotoInput.value =
        fotoFinal;


    // Detener cámara

    detenerCamara();


    // Ocultar cámara

    const cameraContainer =
        document.getElementById("Camera");


    if (cameraContainer) {

        cameraContainer.style.display =
            "none";

    }


    cambiarEstadoCamara(
        "Fotografía capturada correctamente."
    );

}


// =====================================================
// LIMPIAR FOTO
// =====================================================

function limpiarFoto() {

    const foto =
        document.getElementById("foto");


    const fotoInput =
        document.getElementById("fotoInput");


    const btnFoto =
        document.getElementById("btnFoto");


    const cameraContainer =
        document.getElementById("Camera");


    if (foto) {

        foto.src =
            "img/default.jpg";

    }


    if (fotoInput) {

        fotoInput.value =
            "";

    }


    if (btnFoto) {

        btnFoto.value =
            "";

    }


    detenerCamara();


    if (cameraContainer) {

        cameraContainer.style.display =
            "block";

    }


    cambiarEstadoCamara(
        "Cámara lista para tomar una foto."
    );

}


// =====================================================
// DETENER CÁMARA
// =====================================================

function detenerCamara() {

    const video =
        document.getElementById("Video");


    if (!video) {
        return;
    }


    if (video.srcObject) {

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


    video.pause();


    streaming =
        false;

}


// =====================================================
// ESTADO DE CÁMARA
// =====================================================

function cambiarEstadoCamara(mensaje) {

    const estado =
        document.getElementById("cameraStatus");


    if (estado) {

        estado.textContent =
            mensaje;

    }

}


// =====================================================
// ERROR DE CÁMARA
// =====================================================

function mostrarErrorCamara(mensaje) {

    const error =
        document.getElementById("cameraError");


    if (error) {

        error.textContent =
            mensaje;

    }


    cambiarEstadoCamara(
        "No se pudo iniciar la cámara."
    );

}


// =====================================================
// PROTEGER LA APLICACIÓN CONTRA ERRORES DE IMAGEN
// =====================================================

document.addEventListener(
    "error",
    function (e) {

        if (
            e.target &&
            e.target.tagName === "IMG"
        ) {

            const imagen =
                e.target;


            // Evitar ciclo infinito

            if (
                !imagen.dataset.defaultError
            ) {

                imagen.dataset.defaultError =
                    "true";


                // Solo intentar la imagen
                // por defecto si existe

                imagen.src =
                    "img/default.jpg";

            }

        }

    },
    true
);
