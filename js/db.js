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


            // =================================================
            // OBTENER DATOS
            // =================================================

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


            // =================================================
            // CONVERTIR PRECIO
            // =================================================

            const precioNumero =
                parseFloat(precio);


            if (isNaN(precioNumero)) {

                alert(
                    "El precio debe ser un número válido."
                );

                return;

            }


            // =================================================
            // OBJETO PLATILLO
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
            // DESACTIVAR BOTÓN
            // =================================================

            const btnAgregar =
                document.getElementById(
                    "btnAgregarPlatillo"
                );


            if (btnAgregar) {

                btnAgregar.disabled = true;

                btnAgregar.innerHTML = `
                    <i class="material-icons left">
                        hourglass_empty
                    </i>
                    Guardando...
                `;

            }


            // =================================================
            // GUARDAR EN FIRESTORE
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


                        // =====================================
                        // LIMPIAR FORMULARIO
                        // =====================================

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


                        // =====================================
                        // MATERIALIZE
                        // =====================================

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

                        if (btnAgregar) {

                            btnAgregar.disabled =
                                false;

                            btnAgregar.innerHTML = `
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
// ELIMINAR PEDIDO DESDE INDEX
// =========================================================
//
// IMPORTANTE:
//
// Los elementos que aparecen en index.html después de
// realizar un pedido pertenecen a:
//
//     pedidos
//
// NO a:
//
//     platillos
//
// Por eso aquí eliminamos de "pedidos".
// =========================================================


const contenedorRecetas =
    document.querySelector(".recipes");


if (contenedorRecetas) {

    contenedorRecetas.addEventListener(
        "click",
        function (e) {

            // =================================================
            // BUSCAR BOTÓN / ICONO DE ELIMINAR
            // =================================================

            const iconoEliminar =
                e.target.closest(
                    ".recipe-delete i"
                );


            if (!iconoEliminar) {

                return;

            }


            // =================================================
            // OBTENER ID DEL PEDIDO
            // =================================================

            const id =
                iconoEliminar.getAttribute(
                    "data-id"
                );


            if (!id) {

                console.error(
                    "No se encontró el ID del pedido."
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
            // ENCONTRAR TARJETA
            // =================================================

            const tarjeta =
                document.getElementById(
                    "pedido_" + id
                );


            // =================================================
            // ELIMINAR VISUALMENTE INMEDIATAMENTE
            // =================================================
            //
            // Esto hace que desaparezca de la pantalla
            // inmediatamente, sin esperar a Firebase.
            //
            // Si Firebase falla, la tarjeta se vuelve a
            // mostrar mediante la recarga del snapshot.
            // =================================================

            if (tarjeta) {

                tarjeta.remove();

            }


            // =================================================
            // ELIMINAR DE FIRESTORE
            // =================================================

            db.collection("pedidos")
                .doc(id)
                .delete()

                .then(
                    function () {

                        console.log(
                            "Pedido eliminado correctamente:",
                            id
                        );


                        // =====================================
                        // VERIFICAR SI YA NO HAY PEDIDOS
                        // =====================================

                        const recetas =
                            document.querySelector(
                                ".recipes"
                            );


                        if (
                            recetas &&
                            recetas.children.length === 0
                        ) {

                            console.log(
                                "No hay pedidos."
                            );

                        }

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


                        // =====================================
                        // RECARGAR LA PÁGINA
                        // =====================================
                        //
                        // Si Firebase rechazó la eliminación,
                        // el snapshot volverá a mostrar el
                        // pedido.
                        // =====================================

                        location.reload();

                    }
                );

        }
    );

}


// =========================================================
// LIMPIAR PEDIDOS ANTIGUOS DE LOCALSTORAGE
// =========================================================
//
// Ya no necesitamos usar localStorage para mostrar los
// pedidos porque index.js los obtiene directamente de
// Firebase.
//
// =========================================================

try {

    localStorage.removeItem(
        "nuevoPlatilloIndex"
    );

}
catch (error) {

    console.warn(
        "No se pudo limpiar localStorage:",
        error
    );

}
