// =========================================================
// DITS - DB.JS
// Firebase Firestore
// =========================================================


// =========================================================
// MOSTRAR PLATILLOS DESDE FIRESTORE
// =========================================================

db.collection("platillos").onSnapshot((coleccion) => {

    coleccion.docChanges().forEach((registro) => {

        // Nuevo platillo
        if (registro.type === "added") {

            mostrarPlatillo(
                registro.doc.data(),
                registro.doc.id
            );

        }


        // Platillo modificado
        if (registro.type === "modified") {

            actualizarPlatillo(
                registro.doc.data(),
                registro.doc.id
            );

        }


        // Platillo eliminado
        if (registro.type === "removed") {

            borrarPlatillo(
                registro.doc.id
            );

        }

    });

});


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

            const nombre =
                document.getElementById("title").value.trim();


            const ingredientes =
                document.getElementById("ingredients").value.trim();


            const precio =
                document.getElementById("price").value;


            const foto =
                document.getElementById("fotoInput").value;


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
            // OBJETO PLATILLO
            // =================================================

            const platilloNuevo = {

                nombre: nombre,

                ingredientes: ingredientes,

                precio: parseFloat(precio),

                foto: foto || ""

            };


            // =================================================
            // GUARDAR EN FIRESTORE
            // =================================================

            db.collection("platillos")
                .add(platilloNuevo)

                .then(() => {

                    alert(
                        "Platillo agregado correctamente."
                    );


                    // Limpiar formulario

                    formularioAgregar.reset();


                    // Restaurar foto

                    const fotoElement =
                        document.getElementById("foto");


                    if (fotoElement) {

                        fotoElement.src =
                            "img/default.jpg";

                    }


                    const fotoInput =
                        document.getElementById("fotoInput");


                    if (fotoInput) {

                        fotoInput.value = "";

                    }


                    const btnFoto =
                        document.getElementById("btnFoto");


                    if (btnFoto) {

                        btnFoto.value = "";

                    }


                    // Actualizar campos Materialize

                    M.updateTextFields();


                })

                .catch((error) => {

                    console.error(
                        "Error al agregar platillo:",
                        error
                    );


                    alert(
                        "Error al agregar el platillo."
                    );

                });

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

            // Detectar icono eliminar

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


                db.collection("platillos")
                    .doc(id)
                    .delete()

                    .then(() => {

                        alert(
                            "Platillo eliminado correctamente."
                        );

                    })

                    .catch((error) => {

                        console.error(
                            "Error al eliminar:",
                            error
                        );


                        alert(
                            "Error al eliminar el platillo."
                        );

                    });

            }

        }

    );

}
