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

            if (typeof db === "undefined") {

                console.error(
                    "Firebase no está disponible."
                );

                alert(
                    "Firebase no está disponible."
                );

                return;

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
                        // RESTAURAR FOTO
                        // =====================================

                        const foto =
                            document.getElementById("foto");


                        if (foto) {

                            foto.src =
                                "img/default.jpg";

                        }


                        const fotoInput =
                            document.getElementById("fotoInput");


                        if (fotoInput) {

                            fotoInput.value =
                                "";

                        }


                        const btnFoto =
                            document.getElementById("btnFoto");


                        if (btnFoto) {

                            btnFoto.value =
                                "";

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
                );

        }
    );

}


// =========================================================
// ELIMINAR PLATILLO
// =========================================================

const platilloBorrar =
    document.querySelector(".recipes");


if (platilloBorrar) {

    platilloBorrar.addEventListener(
        "click",
        function (e) {

            // =================================================
            // DETECTAR ICONO ELIMINAR
            // =================================================

            if (
                e.target.tagName === "I" &&
                e.target.getAttribute("data-id")
            ) {

                const id =
                    e.target.getAttribute("data-id");


                const confirmar =
                    confirm(
                        "¿Seguro que deseas eliminar este platillo?"
                    );


                if (!confirmar) {

                    return;

                }


                // =================================================
                // ELIMINAR DE FIRESTORE
                // =================================================

                if (typeof db === "undefined") {

                    console.error(
                        "Firebase no está disponible."
                    );

                    alert(
                        "Firebase no está disponible."
                    );

                    return;

                }


                db.collection("platillos")
                    .doc(id)
                    .delete()

                    .then(
                        function () {

                            alert(
                                "Platillo eliminado correctamente."
                            );

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                "Error al eliminar:",
                                error
                            );


                            alert(
                                "Error al eliminar el platillo."
                            );

                        }
                    );

            }

        }
    );

}
