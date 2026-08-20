// =========================================================
// DITS - DB.JS
// Firebase Firestore
// =========================================================


// =========================================================
// FORMULARIO AGREGAR PLATILLO
// =========================================================

const formularioAgregar =
    document.getElementById("formAgregar");


if (formularioAgregar) {

    formularioAgregar.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const nombreElemento =
                document.getElementById("title");

            const ingredientesElemento =
                document.getElementById("ingredients");

            const precioElemento =
                document.getElementById("price");

            const fotoElemento =
                document.getElementById("fotoInput");


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
                    ? fotoElemento.value.trim()
                    : "";


            // =================================================
            // VALIDAR
            // =================================================

            if (
                nombre === "" ||
                ingredientes === "" ||
                precio === ""
            ) {

                alert(
                    "Por favor completa todos los campos."
                );

                return;

            }


            const precioNumero =
                parseFloat(precio);


            if (isNaN(precioNumero)) {

                alert(
                    "El precio debe ser un número válido."
                );

                return;

            }


            // =================================================
            // OBJETO
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


            // =================================================
            // FIREBASE
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


            const boton =
                document.getElementById(
                    "btnAgregarPlatillo"
                );


            if (boton) {

                boton.disabled = true;

                boton.innerHTML = `
                    <i class="material-icons left">
                        hourglass_empty
                    </i>
                    Guardando...
                `;

            }


            // =================================================
            // GUARDAR
            // =================================================

            db.collection("platillos")
                .add(platilloNuevo)

                .then(
                    function (docRef) {

                        console.log(
                            "Platillo agregado:",
                            docRef.id
                        );


                        alert(
                            "Platillo agregado correctamente."
                        );


                        formularioAgregar.reset();


                        // =====================================
                        // LIMPIAR FOTO
                        // =====================================

                        const foto =
                            document.getElementById(
                                "foto"
                            );


                        if (foto) {

                            foto.src = "";

                            foto.style.display =
                                "none";

                        }


                        const fotoInput =
                            document.getElementById(
                                "fotoInput"
                            );


                        if (fotoInput) {

                            fotoInput.value = "";

                        }


                        const btnFoto =
                            document.getElementById(
                                "btnFoto"
                            );


                        if (btnFoto) {

                            btnFoto.value = "";

                        }


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


                        alert(
                            "Error al agregar el platillo."
                        );

                    }
                )

                .finally(
                    function () {

                        if (boton) {

                            boton.disabled = false;

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
// ELIMINAR PEDIDO DEL INDEX
// =========================================================

const contenedorRecetas =
    document.querySelector(".recipes");


if (contenedorRecetas) {

    contenedorRecetas.addEventListener(
        "click",
        function (e) {

            // =================================================
            // BUSCAR ICONO
            // =================================================

            const icono =
                e.target.closest(
                    ".recipe-delete i"
                );


            if (!icono) {

                return;

            }


            // =================================================
            // ID DEL PEDIDO
            // =================================================

            const id =
                icono.getAttribute(
                    "data-id"
                );


            if (!id) {

                console.error(
                    "El botón de eliminar no tiene data-id."
                );

                return;

            }


            // =================================================
            // CONFIRMAR
            // =================================================

            const confirmar =
                confirm(
                    "¿Seguro que deseas eliminar este pedido?"
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
            // OBTENER TARJETA
            // =================================================

            const tarjeta =
                document.getElementById(
                    "pedido_" + id
                );


            // =================================================
            // BORRAR INMEDIATAMENTE DE LA PANTALLA
            // =================================================

            if (tarjeta) {

                tarjeta.remove();

            }


            // =================================================
            // BORRAR DE FIRESTORE
            // =================================================

            db.collection("pedidos")
                .doc(id)
                .delete()

                .then(
                    function () {

                        console.log(
                            "Pedido eliminado:",
                            id
                        );

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


                        // Recargar para recuperar
                        // el pedido si Firebase falló.

                        location.reload();

                    }
                );

        }
    );

}


// =========================================================
// ELIMINAR DATO ANTIGUO DE LOCALSTORAGE
// =========================================================

try {

    localStorage.removeItem(
        "nuevoPlatilloIndex"
    );

}
catch (error) {

    console.warn(
        "No se pudo limpiar localStorage."
    );

}
