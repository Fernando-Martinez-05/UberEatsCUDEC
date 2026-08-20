// =========================================================
// DITS - DB.JS
// FIREBASE FIRESTORE + STORAGE
// =========================================================


// =========================================================
// FORMULARIO AGREGAR PLATILLO
// =========================================================

const formularioAgregar =
    document.getElementById("formAgregar");


if (formularioAgregar) {

    formularioAgregar.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            // =================================================
            // OBTENER ELEMENTOS
            // =================================================

            const nombreElemento =
                document.getElementById("title");


            const ingredientesElemento =
                document.getElementById("ingredients");


            const precioElemento =
                document.getElementById("price");


            const fotoElemento =
                document.getElementById("fotoInput");


            // =================================================
            // OBTENER VALORES
            // =================================================

            const nombre =
                nombreElemento
                    ? nombreElemento.value.trim()
                    : "";


            const ingredientes =
                ingredientesElemento
                    ? ingredientesElemento.value.trim()
                    : "";


            const precio =
                precioElemento
                    ? precioElemento.value
                    : "";


            const fotoBase64 =
                fotoElemento
                    ? fotoElemento.value
                    : "";


            // =================================================
            // VALIDAR
            // =================================================

            if (
                nombre === "" ||
                ingredientes === "" ||
                precio === ""
            ) {

                mostrarMensaje(
                    "Por favor completa todos los campos."
                );

                return;

            }


            // =================================================
            // CONVERTIR PRECIO
            // =================================================

            const precioNumero =
                parseFloat(precio);


            if (isNaN(precioNumero)) {

                mostrarMensaje(
                    "El precio debe ser un número válido."
                );

                return;

            }


            // =================================================
            // VERIFICAR FIREBASE
            // =================================================

            if (
                typeof db === "undefined"
            ) {

                console.error(
                    "Firebase Firestore no está disponible."
                );

                mostrarMensaje(
                    "Firebase no está disponible."
                );

                return;

            }


            // =================================================
            // VERIFICAR STORAGE
            // =================================================

            if (
                typeof firebase === "undefined" ||
                !firebase.storage
            ) {

                console.error(
                    "Firebase Storage no está disponible."
                );

                mostrarMensaje(
                    "Firebase Storage no está disponible."
                );

                return;

            }


            // =================================================
            // BOTÓN
            // =================================================

            const boton =
                document.getElementById(
                    "btnAgregarPlatillo"
                );


            if (boton) {

                boton.disabled = true;

                boton.innerHTML = `
                    <i class="material-icons left">
                        cloud_upload
                    </i>
                    Subiendo foto...
                `;

            }


            try {

                // =================================================
                // URL FINAL DE LA FOTO
                // =================================================

                let urlFoto = "";


                // =================================================
                // SI HAY FOTO
                // =================================================

                if (
                    fotoBase64 &&
                    fotoBase64.trim() !== ""
                ) {

                    console.log(
                        "Preparando imagen para Firebase Storage..."
                    );


                    // =================================================
                    // CONVERTIR BASE64 A BLOB
                    // =================================================

                    const blob =
                        convertirBase64ABlob(
                            fotoBase64
                        );


                    // =================================================
                    // NOMBRE ÚNICO
                    // =================================================

                    const nombreArchivo =
                        "platillos/" +
                        Date.now() +
                        "_" +
                        generarIdAleatorio() +
                        ".jpg";


                    // =================================================
                    // REFERENCIA STORAGE
                    // =================================================

                    const referencia =
                        firebase
                            .storage()
                            .ref()
                            .child(nombreArchivo);


                    // =================================================
                    // SUBIR FOTO
                    // =================================================

                    if (boton) {

                        boton.innerHTML = `
                            <i class="material-icons left">
                                cloud_upload
                            </i>
                            Subiendo foto...
                        `;

                    }


                    const resultadoUpload =
                        await referencia.put(
                            blob,
                            {
                                contentType:
                                    "image/jpeg"
                            }
                        );


                    console.log(
                        "Foto subida correctamente."
                    );


                    // =================================================
                    // OBTENER URL
                    // =================================================

                    urlFoto =
                        await resultadoUpload
                            .ref
                            .getDownloadURL();


                    console.log(
                        "URL de la foto:",
                        urlFoto
                    );

                }


                // =================================================
                // CREAR PLATILLO
                // =================================================

                const platilloNuevo = {

                    nombre:
                        nombre,

                    ingredientes:
                        ingredientes,

                    precio:
                        precioNumero,

                    foto:
                        urlFoto

                };


                console.log(
                    "Platillo que se guardará:",
                    platilloNuevo
                );


                // =================================================
                // GUARDAR EN FIRESTORE
                // =================================================

                if (boton) {

                    boton.innerHTML = `
                        <i class="material-icons left">
                            save
                        </i>
                        Guardando...
                    `;

                }


                const docRef =
                    await db
                        .collection("platillos")
                        .add(
                            platilloNuevo
                        );


                console.log(
                    "Platillo agregado correctamente:",
                    docRef.id
                );


                // =================================================
                // MENSAJE
                // =================================================

                mostrarMensaje(
                    "Platillo agregado correctamente."
                );


                // =================================================
                // LIMPIAR FORMULARIO
                // =================================================

                formularioAgregar.reset();


                // =================================================
                // LIMPIAR FOTO
                // =================================================

                if (
                    typeof limpiarFoto ===
                    "function"
                ) {

                    limpiarFoto();

                }
                else {

                    const foto =
                        document.getElementById(
                            "foto"
                        );


                    const fotoInput =
                        document.getElementById(
                            "fotoInput"
                        );


                    const btnFoto =
                        document.getElementById(
                            "btnFoto"
                        );


                    if (foto) {

                        foto.src = "";

                        foto.style.display =
                            "none";

                    }


                    if (fotoInput) {

                        fotoInput.value = "";

                    }


                    if (btnFoto) {

                        btnFoto.value = "";

                    }

                }


                // =================================================
                // MATERIALIZE
                // =================================================

                if (
                    typeof M !== "undefined"
                ) {

                    M.updateTextFields();

                }

            }

            catch (error) {

                console.error(
                    "Error al agregar platillo:",
                    error
                );


                let mensaje =
                    "Error al guardar el platillo.";


                if (
                    error &&
                    error.code
                ) {

                    console.error(
                        "Código de error:",
                        error.code
                    );

                }


                mostrarMensaje(
                    mensaje
                );

            }

            finally {

                // =================================================
                // RESTAURAR BOTÓN
                // =================================================

                if (boton) {

                    boton.disabled =
                        false;


                    boton.innerHTML = `
                        <i class="material-icons left">
                            add
                        </i>
                        Agregar platillo
                    `;

                }

            }

        }
    );

}


// =========================================================
// CONVERTIR BASE64 A BLOB
// =========================================================

function convertirBase64ABlob(
    base64
) {

    const partes =
        base64.split(",");


    const tipo =
        partes[0]
            .match(
                /:(.*?);/
            );


    const contenido =
        atob(
            partes[1]
        );


    const arreglo =
        new Uint8Array(
            contenido.length
        );


    for (
        let i = 0;
        i < contenido.length;
        i++
    ) {

        arreglo[i] =
            contenido.charCodeAt(i);

    }


    return new Blob(
        [
            arreglo
        ],
        {
            type:
                tipo
                    ? tipo[1]
                    : "image/jpeg"
        }
    );

}


// =========================================================
// GENERAR ID ALEATORIO
// =========================================================

function generarIdAleatorio() {

    return Math.random()
        .toString(36)
        .substring(2, 10);

}


// =========================================================
// MOSTRAR MENSAJE
// =========================================================

function mostrarMensaje(
    mensaje
) {

    if (
        typeof M !== "undefined"
    ) {

        M.toast({
            html: mensaje
        });

    }
    else {

        alert(
            mensaje
        );

    }

}


// =========================================================
// ELIMINAR PLATILLO
// =========================================================

const contenedorPlatillos =
    document.querySelector(
        ".recipes"
    );


if (contenedorPlatillos) {

    contenedorPlatillos.addEventListener(
        "click",
        function (e) {

            const boton =
                e.target.closest(
                    ".btn-eliminar-platillo"
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


            eliminarPlatillo(
                id
            );

        }
    );

}


// =========================================================
// ELIMINAR PLATILLO
// =========================================================

function eliminarPlatillo(
    id
) {

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


    if (
        typeof db === "undefined"
    ) {

        mostrarMensaje(
            "Firebase no está disponible."
        );

        return;

    }


    const tarjeta =
        document.getElementById(
            id
        );


    if (tarjeta) {

        tarjeta.style.transition =
            "opacity 0.2s ease, transform 0.2s ease";


        tarjeta.style.opacity =
            "0";


        tarjeta.style.transform =
            "scale(0.95)";

    }


    db.collection("platillos")
        .doc(id)
        .delete()

        .then(
            function () {

                console.log(
                    "Platillo eliminado:",
                    id
                );


                if (tarjeta) {

                    tarjeta.remove();

                }


                mostrarMensaje(
                    "Platillo eliminado correctamente."
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error al eliminar platillo:",
                    error
                );


                if (tarjeta) {

                    tarjeta.style.opacity =
                        "1";


                    tarjeta.style.transform =
                        "scale(1)";

                }


                mostrarMensaje(
                    "Error al eliminar el platillo."
                );

            }
        );

}


// =========================================================
// HACER FUNCIÓN DISPONIBLE
// =========================================================

window.eliminarPlatillo =
    eliminarPlatillo;
