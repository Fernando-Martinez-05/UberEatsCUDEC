// =========================================================
// DITS - DB.JS
// FIREBASE FIRESTORE
// =========================================================


// =========================================================
// FORMULARIO AGREGAR PLATILLO
// =========================================================

const formularioAgregar =
    document.getElementById(
        "formAgregar"
    );


if (formularioAgregar) {

    formularioAgregar.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            // =================================================
            // OBTENER ELEMENTOS
            // =================================================

            const nombreElemento =
                document.getElementById(
                    "title"
                );


            const ingredientesElemento =
                document.getElementById(
                    "ingredients"
                );


            const precioElemento =
                document.getElementById(
                    "price"
                );


            const fotoElemento =
                document.getElementById(
                    "fotoInput"
                );


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


            const foto =
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

                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "Por favor completa todos los campos."
                    });

                }
                else {

                    alert(
                        "Por favor completa todos los campos."
                    );

                }


                return;

            }


            // =================================================
            // CONVERTIR PRECIO
            // =================================================

            const precioNumero =
                parseFloat(
                    precio
                );


            if (
                isNaN(precioNumero)
            ) {

                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "El precio debe ser un número válido."
                    });

                }
                else {

                    alert(
                        "El precio debe ser un número válido."
                    );

                }


                return;

            }


            // =================================================
            // VERIFICAR FIREBASE
            // =================================================

            if (
                typeof db === "undefined"
            ) {

                console.error(
                    "Firebase no está disponible."
                );


                alert(
                    "Firebase no está disponible."
                );


                return;

            }


            // =================================================
            // CREAR OBJETO
            // =================================================

            const platilloNuevo = {

                nombre:
                    nombre,

                ingredientes:
                    ingredientes,

                precio:
                    precioNumero,

                foto:
                    foto || ""

            };


            console.log(
                "Platillo que se guardará:",
                platilloNuevo
            );


            // =================================================
            // DESACTIVAR BOTÓN
            // =================================================

            const boton =
                document.getElementById(
                    "btnAgregarPlatillo"
                );


            if (boton) {

                boton.disabled =
                    true;


                boton.innerHTML = `
                    <i class="material-icons left">
                        hourglass_empty
                    </i>
                    Guardando...
                `;

            }


            // =================================================
            // GUARDAR FIRESTORE
            // =================================================

            db.collection("platillos")
                .add(
                    platilloNuevo
                )

                .then(
                    function (docRef) {

                        console.log(
                            "Platillo agregado correctamente:",
                            docRef.id
                        );


                        // =================================================
                        // MENSAJE
                        // =================================================

                        if (
                            typeof M !== "undefined"
                        ) {

                            M.toast({
                                html:
                                    "Platillo agregado correctamente."
                            });

                        }
                        else {

                            alert(
                                "Platillo agregado correctamente."
                            );

                        }


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

                                foto.src =
                                    "";

                                foto.style.display =
                                    "none";

                            }


                            if (fotoInput) {

                                fotoInput.value =
                                    "";

                            }


                            if (btnFoto) {

                                btnFoto.value =
                                    "";

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
                )

                .catch(
                    function (error) {

                        console.error(
                            "Error al agregar platillo:",
                            error
                        );


                        if (
                            typeof M !== "undefined"
                        ) {

                            M.toast({
                                html:
                                    "Error al guardar el platillo."
                            });

                        }
                        else {

                            alert(
                                "Error al guardar el platillo."
                            );

                        }

                    }
                )

                .finally(
                    function () {

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
                );

        }
    );

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

            // =================================================
            // BUSCAR BOTÓN DE ELIMINAR
            // =================================================

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


    // =================================================
    // FIREBASE
    // =================================================

    if (
        typeof db === "undefined"
    ) {

        alert(
            "Firebase no está disponible."
        );


        return;

    }


    // =================================================
    // TARJETA
    // =================================================

    const tarjeta =
        document.getElementById(
            id
        );


    // =================================================
    // ANIMACIÓN
    // =================================================

    if (tarjeta) {

        tarjeta.style.transition =
            "opacity 0.2s ease, transform 0.2s ease";


        tarjeta.style.opacity =
            "0";


        tarjeta.style.transform =
            "scale(0.95)";

    }


    // =================================================
    // ELIMINAR FIRESTORE
    // =================================================

    db.collection("platillos")
        .doc(id)
        .delete()

        .then(
            function () {

                console.log(
                    "Platillo eliminado:",
                    id
                );


                // =================================================
                // ELIMINAR VISUALMENTE
                // =================================================

                if (tarjeta) {

                    tarjeta.remove();

                }


                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "Platillo eliminado correctamente."
                    });

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Error al eliminar platillo:",
                    error
                );


                // =================================================
                // RESTAURAR TARJETA
                // =================================================

                if (tarjeta) {

                    tarjeta.style.opacity =
                        "1";


                    tarjeta.style.transform =
                        "scale(1)";

                }


                if (
                    typeof M !== "undefined"
                ) {

                    M.toast({
                        html:
                            "Error al eliminar el platillo."
                    });

                }
                else {

                    alert(
                        "Error al eliminar el platillo."
                    );

                }

            }
        );

}


// =========================================================
// HACER FUNCIONES DISPONIBLES
// =========================================================

window.eliminarPlatillo =
    eliminarPlatillo;
