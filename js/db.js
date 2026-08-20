// =========================================================
// DITS - DB.JS
// Firebase Firestore
// =========================================================


// =========================================================
// VARIABLES
// =========================================================

const contenedorPlatillos =
    document.querySelector(".recipes");


// =========================================================
// VERIFICAR FIREBASE
// =========================================================

if (typeof db === "undefined") {

    console.error(
        "ERROR: Firebase / Firestore no está disponible."
    );

}


// =========================================================
// LEER PLATILLOS DESDE FIRESTORE
// =========================================================
//
// Esta función escucha los cambios en tiempo real.
// Cuando se agrega, modifica o elimina un platillo,
// la pantalla se actualiza automáticamente.
//
// =========================================================

if (
    typeof db !== "undefined" &&
    contenedorPlatillos
) {

    db.collection("platillos").onSnapshot(

        function (coleccion) {

            coleccion.docChanges().forEach(

                function (registro) {

                    const datos =
                        registro.doc.data();

                    const id =
                        registro.doc.id;


                    // =========================================
                    // PLATILLO NUEVO
                    // =========================================

                    if (
                        registro.type === "added"
                    ) {

                        mostrarPlatillo(
                            datos,
                            id
                        );

                    }


                    // =========================================
                    // PLATILLO MODIFICADO
                    // =========================================

                    if (
                        registro.type === "modified"
                    ) {

                        actualizarPlatillo(
                            datos,
                            id
                        );

                    }


                    // =========================================
                    // PLATILLO ELIMINADO
                    // =========================================

                    if (
                        registro.type === "removed"
                    ) {

                        borrarPlatillo(
                            id
                        );

                    }

                }

            );

        },

        function (error) {

            console.error(
                "Error leyendo platillos:",
                error
            );

        }

    );

}


// =========================================================
// MOSTRAR PLATILLO
// =========================================================

function mostrarPlatillo(
    platillo,
    id
) {

    if (!contenedorPlatillos) {
        return;
    }


    // =========================================
    // EVITAR DUPLICADOS
    // =========================================

    const existente =
        document.getElementById(
            "platillo_" + id
        );


    if (existente) {

        return;

    }


    // =========================================
    // CREAR TARJETA
    // =========================================

    const tarjeta =
        document.createElement("div");


    tarjeta.className =
        "card-panel recipe white row";


    tarjeta.id =
        "platillo_" + id;


    tarjeta.setAttribute(
        "data-id",
        id
    );


    // =========================================
    // DATOS
    // =========================================

    const nombre =
        platillo.nombre ||
        "Sin nombre";


    const ingredientes =
        platillo.ingredientes ||
        "Sin ingredientes";


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    const foto =
        platillo.foto ||
        "";


    // =========================================
    // IMAGEN
    // =========================================

    let imagenHTML = "";


    if (foto !== "") {

        imagenHTML = `

            <img
                src="${foto}"
                alt="${nombre}"
                width="100"
                height="100"
                style="
                    object-fit:cover;
                    border-radius:10px;
                "
                onerror="
                    this.style.display='none';
                "
            >

        `;

    }

    else {

        imagenHTML = `

            <div
                style="
                    width:100px;
                    height:100px;
                    background:#eeeeee;
                    border-radius:10px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-shrink:0;
                "
            >

                <i
                    class="material-icons grey-text"
                    style="font-size:45px;"
                >
                    restaurant
                </i>

            </div>

        `;

    }


    // =========================================
    // HTML DE LA TARJETA
    // =========================================

    tarjeta.innerHTML = `

        ${imagenHTML}


        <div
            class="recipe-details"
            style="
                flex:1;
                margin-left:15px;
            "
        >

            <div
                class="recipe-title"
            >
                ${nombre}
            </div>


            <div
                class="recipe-ingredients"
            >
                ${ingredientes}
            </div>


            <div
                class="recipe-price"
                style="
                    font-weight:bold;
                    margin-top:5px;
                "
            >
                $${precio.toFixed(2)} MXN
            </div>


            <div
                class="recipe-delete"
                style="
                    cursor:pointer;
                    margin-top:10px;
                "
            >

                <i
                    class="material-icons red-text"
                    data-id="${id}"
                    title="Eliminar platillo"
                >
                    delete_outline
                </i>

            </div>

        </div>

    `;


    // =========================================
    // AGREGAR A LA PÁGINA
    // =========================================

    contenedorPlatillos.appendChild(
        tarjeta
    );

}


// =========================================================
// ACTUALIZAR PLATILLO
// =========================================================

function actualizarPlatillo(
    platillo,
    id
) {

    if (!contenedorPlatillos) {
        return;
    }


    const tarjeta =
        document.getElementById(
            "platillo_" + id
        );


    // Si no existe, lo creamos
    if (!tarjeta) {

        mostrarPlatillo(
            platillo,
            id
        );

        return;

    }


    // =========================================
    // DATOS
    // =========================================

    const nombre =
        platillo.nombre ||
        "Sin nombre";


    const ingredientes =
        platillo.ingredientes ||
        "Sin ingredientes";


    const precio =
        parseFloat(
            platillo.precio || 0
        );


    const foto =
        platillo.foto ||
        "";


    // =========================================
    // IMAGEN
    // =========================================

    let imagenHTML = "";


    if (foto !== "") {

        imagenHTML = `

            <img
                src="${foto}"
                alt="${nombre}"
                width="100"
                height="100"
                style="
                    object-fit:cover;
                    border-radius:10px;
                "
                onerror="
                    this.style.display='none';
                "
            >

        `;

    }

    else {

        imagenHTML = `

            <div
                style="
                    width:100px;
                    height:100px;
                    background:#eeeeee;
                    border-radius:10px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-shrink:0;
                "
            >

                <i
                    class="material-icons grey-text"
                    style="font-size:45px;"
                >
                    restaurant
                </i>

            </div>

        `;

    }


    // =========================================
    // ACTUALIZAR TARJETA
    // =========================================

    tarjeta.innerHTML = `

        ${imagenHTML}


        <div
            class="recipe-details"
            style="
                flex:1;
                margin-left:15px;
            "
        >

            <div
                class="recipe-title"
            >
                ${nombre}
            </div>


            <div
                class="recipe-ingredients"
            >
                ${ingredientes}
            </div>


            <div
                class="recipe-price"
                style="
                    font-weight:bold;
                    margin-top:5px;
                "
            >
                $${precio.toFixed(2)} MXN
            </div>


            <div
                class="recipe-delete"
                style="
                    cursor:pointer;
                    margin-top:10px;
                "
            >

                <i
                    class="material-icons red-text"
                    data-id="${id}"
                    title="Eliminar platillo"
                >
                    delete_outline
                </i>

            </div>

        </div>

    `;

}


// =========================================================
// BORRAR PLATILLO DE LA PANTALLA
// =========================================================

function borrarPlatillo(
    id
) {

    const tarjeta =
        document.getElementById(
            "platillo_" + id
        );


    if (tarjeta) {

        tarjeta.remove();

    }

}


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


            // =========================================
            // OBTENER ELEMENTOS
            // =========================================

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


            // =========================================
            // OBTENER VALORES
            // =========================================

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


            // =========================================
            // VALIDAR
            // =========================================

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
                            "Completa todos los campos"
                    });

                }

                else {

                    alert(
                        "Completa todos los campos"
                    );

                }

                return;

            }


            // =========================================
            // CONVERTIR PRECIO
            // =========================================

            const precioNumero =
                Number(precio);


            if (
                isNaN(precioNumero) ||
                precioNumero < 0
            ) {

                alert(
                    "Ingresa un precio válido."
                );

                return;

            }


            // =========================================
            // CREAR PLATILLO
            // =========================================

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


            // =========================================
            // VERIFICAR FIREBASE
            // =========================================

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


            // =========================================
            // DESACTIVAR BOTÓN
            // =========================================

            const boton =
                document.getElementById(
                    "btnAgregarPlatillo"
                );


            if (boton) {

                boton.disabled = true;

                boton.innerHTML = `

                    <i
                        class="material-icons left"
                    >
                        hourglass_empty
                    </i>

                    Guardando...

                `;

            }


            // =========================================
            // GUARDAR EN FIRESTORE
            // =========================================

            db.collection("platillos")
                .add(platilloNuevo)

                .then(
                    function (docRef) {

                        console.log(
                            "Platillo agregado:",
                            docRef.id
                        );


                        if (
                            typeof M !== "undefined"
                        ) {

                            M.toast({
                                html:
                                    "Platillo agregado correctamente"
                            });

                        }

                        else {

                            alert(
                                "Platillo agregado correctamente"
                            );

                        }


                        // =================================
                        // LIMPIAR FORMULARIO
                        // =================================

                        formularioAgregar.reset();


                        // =================================
                        // LIMPIAR FOTO
                        // =================================

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

                            fotoInput.value =
                                "";

                        }


                        const btnFoto =
                            document.getElementById(
                                "btnFoto"
                            );


                        if (btnFoto) {

                            btnFoto.value =
                                "";

                        }


                        // =================================
                        // MATERIALIZE
                        // =================================

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
                            "Error al guardar platillo:",
                            error
                        );


                        alert(
                            "Error al guardar el platillo."
                        );

                    }
                )

                .finally(
                    function () {

                        if (boton) {

                            boton.disabled =
                                false;


                            boton.innerHTML = `

                                <i
                                    class="material-icons left"
                                >
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
//
// IMPORTANTE:
// El evento se coloca sobre .recipes usando
// delegación de eventos.
//
// Esto permite borrar también tarjetas creadas
// dinámicamente por Firestore.
//
// =========================================================

if (contenedorPlatillos) {

    contenedorPlatillos.addEventListener(
        "click",
        function (e) {

            // =========================================
            // BUSCAR ICONO
            // =========================================

            const icono =
                e.target.closest(
                    "i[data-id]"
                );


            if (!icono) {
                return;
            }


            const id =
                icono.getAttribute(
                    "data-id"
                );


            if (!id) {
                return;
            }


            // =========================================
            // CONFIRMAR
            // =========================================

            const confirmar =
                confirm(
                    "¿Seguro que deseas eliminar este platillo?"
                );


            if (!confirmar) {
                return;
            }


            // =========================================
            // VERIFICAR FIREBASE
            // =========================================

            if (
                typeof db === "undefined"
            ) {

                alert(
                    "Firebase no está disponible."
                );

                return;

            }


            // =========================================
            // DESACTIVAR ICONO
            // =========================================

            icono.style.pointerEvents =
                "none";


            icono.textContent =
                "hourglass_empty";


            // =========================================
            // ELIMINAR DE FIRESTORE
            // =========================================

            db.collection("platillos")
                .doc(id)
                .delete()

                .then(
                    function () {

                        console.log(
                            "Platillo eliminado:",
                            id
                        );


                        /*
                         * NO necesitamos eliminar
                         * manualmente la tarjeta.
                         *
                         * Firestore ejecutará
                         * registro.type === "removed"
                         *
                         * y borrarPlatillo() la quitará
                         * automáticamente.
                         */

                    }
                )

                .catch(
                    function (error) {

                        console.error(
                            "Error eliminando platillo:",
                            error
                        );


                        icono.style.pointerEvents =
                            "auto";


                        icono.textContent =
                            "delete_outline";


                        alert(
                            "No se pudo eliminar el platillo."
                        );

                    }
                );

        }
    );

}


// =========================================================
// MENSAJE DE DEPURACIÓN
// =========================================================

console.log(
    "DITS - db.js cargado correctamente."
);
