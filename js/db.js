// =========================================
// DITS - BASE DE DATOS FIRESTORE
// =========================================


// =========================================
// CARGAR PLATILLOS
// =========================================

db.collection("platillos").onSnapshot((coleccion) => {

    coleccion.docChanges().forEach((registro) => {

        const platillo = registro.doc.data();
        const id = registro.doc.id;


        // -------------------------------------
        // PLATILLO AGREGADO
        // -------------------------------------

        if (registro.type === "added") {

            mostrarPlatillo(
                platillo,
                id
            );

        }


        // -------------------------------------
        // PLATILLO MODIFICADO
        // -------------------------------------

        if (registro.type === "modified") {

            actualizarPlatillo(
                platillo,
                id
            );

        }


        // -------------------------------------
        // PLATILLO ELIMINADO
        // -------------------------------------

        if (registro.type === "removed") {

            borrarPlatillo(
                id
            );

        }

    });

});


// =========================================
// FORMULARIO AGREGAR PLATILLO
// =========================================

const formularioAgregar =
    document.querySelector(".add-recipe");


if (formularioAgregar) {

    formularioAgregar.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            // ---------------------------------
            // OBTENER DATOS
            // ---------------------------------

            const nombre =
                document.getElementById("title").value.trim();

            const ingredientes =
                document.getElementById("ingredients").value.trim();

            const precio =
                document.getElementById("price").value;

            const foto =
                document.getElementById("fotoInput").value;


            // ---------------------------------
            // VALIDAR
            // ---------------------------------

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


            // ---------------------------------
            // CREAR PLATILLO
            // ---------------------------------

            const platilloNuevo = {

                nombre: nombre,

                ingredientes: ingredientes,

                precio: precio,

                foto: foto || "img/default.jpg"

            };


            // ---------------------------------
            // GUARDAR EN FIRESTORE
            // ---------------------------------

            db.collection("platillos")
                .add(platilloNuevo)

                .then(() => {

                    alert(
                        "Platillo agregado correctamente."
                    );


                    // Limpiar formulario

                    formularioAgregar.reset();


                    // Restaurar imagen

                    const fotoElemento =
                        document.getElementById("foto");

                    if (fotoElemento) {

                        fotoElemento.src =
                            "img/default.jpg";

                    }


                    const fotoInput =
                        document.getElementById("fotoInput");

                    if (fotoInput) {

                        fotoInput.value = "";

                    }

                })

                .catch((error) => {

                    console.error(
                        "Error al agregar el platillo:",
                        error
                    );

                    alert(
                        "Error al agregar el platillo."
                    );

                });

        }
    );

}


// =========================================
// ELIMINAR PLATILLO
// =========================================

const platilloBorrar =
    document.querySelector(".recipes");


if (platilloBorrar) {

    platilloBorrar.addEventListener(
        "click",
        (e) => {


            // Verificar que se presionó
            // el icono de eliminar

            if (
                e.target.tagName === "I"
            ) {

                const id =
                    e.target.getAttribute(
                        "data-id"
                    );


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


                // Eliminar de Firebase

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
                            "Error al eliminar el platillo:",
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
