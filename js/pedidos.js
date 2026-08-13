document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // Inicializar menú lateral
    // ==============================

    const menus = document.querySelectorAll(".sidenav");

    if (menus.length > 0 && typeof M !== "undefined") {

        M.Sidenav.init(menus, {
            edge: "right"
        });

    }


    // ==============================
    // Inicializar selects
    // ==============================

    const selects = document.querySelectorAll("select");

    if (selects.length > 0 && typeof M !== "undefined") {

        M.FormSelect.init(selects);

    }


    // ==============================
    // Cargar platillos desde Firestore
    // ==============================

    if (typeof db !== "undefined") {

        const lista = document.getElementById("listaPlatillos");

        if (lista) {

            db.collection("platillos").onSnapshot((snapshot) => {

                let opciones = `
                    <option value="" disabled selected>
                        Elige un platillo
                    </option>
                `;


                snapshot.forEach(doc => {

                    const platillo = doc.data();

                    opciones += `
                        <option value="${doc.id}">
                            ${platillo.nombre}
                        </option>
                    `;

                });


                lista.innerHTML = opciones;


                // Reiniciar select de Materialize
                if (typeof M !== "undefined") {

                    const instancia =
                        M.FormSelect.getInstance(lista);

                    if (instancia) {
                        instancia.destroy();
                    }

                    M.FormSelect.init(lista);

                }


            }, (error) => {

                console.error(
                    "Error al cargar platillos:",
                    error
                );

            });

        }

    } else {

        console.error(
            "Firestore no está inicializado."
        );

    }



    // ==============================
    // Geolocalización
    // ==============================

    const btnUbicacion =
        document.getElementById("btnUbicacion");


    if (btnUbicacion) {

        btnUbicacion.addEventListener("click", () => {

            const infoUbicacion =
                document.getElementById("infoUbicacion");

            const mapaFrame =
                document.getElementById("mapaFrame");


            if (!navigator.geolocation) {

                if (infoUbicacion) {

                    infoUbicacion.textContent =
                        "Tu navegador no soporta geolocalización.";

                }

                return;

            }


            if (infoUbicacion) {

                infoUbicacion.textContent =
                    "Obteniendo ubicación...";

            }


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    const lat =
                        position.coords.latitude;

                    const lon =
                        position.coords.longitude;


                    if (infoUbicacion) {

                        infoUbicacion.textContent =
                            `📍 Latitud: ${lat.toFixed(5)} | Longitud: ${lon.toFixed(5)}`;

                    }


                    if (mapaFrame) {

                        mapaFrame.src =
                            `https://www.google.com/maps?q=${lat},${lon}&output=embed`;

                        mapaFrame.style.display =
                            "block";

                    }


                    console.log(
                        "Ubicación:",
                        lat,
                        lon
                    );

                },


                (error) => {

                    let mensaje =
                        "No fue posible obtener la ubicación.";


                    switch (error.code) {

                        case error.PERMISSION_DENIED:

                            mensaje =
                                "Permiso de ubicación denegado.";

                            break;


                        case error.POSITION_UNAVAILABLE:

                            mensaje =
                                "Ubicación no disponible.";

                            break;


                        case error.TIMEOUT:

                            mensaje =
                                "Tiempo de espera agotado.";

                            break;

                    }


                    if (infoUbicacion) {

                        infoUbicacion.textContent =
                            mensaje;

                    }


                    console.error(error);

                },


                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }

            );

        });

    }



    // ==============================
    // Agregar platillo
    // ==============================

    const formularioAgregar =
        document.getElementById("formAgregar");


    if (formularioAgregar) {

        formularioAgregar.addEventListener(
            "submit",
            (e) => {

                e.preventDefault();


                const nombre =
                    document.getElementById("title")
                    .value.trim();


                const ingredientes =
                    document.getElementById("ingredients")
                    .value.trim();


                const precio =
                    Number(
                        document.getElementById("price")
                        .value
                    );


                if (!nombre || !ingredientes) {

                    alert(
                        "Completa todos los campos."
                    );

                    return;

                }


                if (isNaN(precio) || precio <= 0) {

                    alert(
                        "Ingresa un precio válido."
                    );

                    return;

                }


                if (typeof db === "undefined") {

                    alert(
                        "Firestore no está disponible."
                    );

                    return;

                }


                const nuevoPlatillo = {

                    nombre,
                    ingredientes,
                    precio

                };


                db.collection("platillos")
                    .add(nuevoPlatillo)

                    .then(() => {

                        alert(
                            "Platillo agregado correctamente."
                        );


                        formularioAgregar.reset();


                        if (typeof M !== "undefined") {

                            M.updateTextFields();

                        }

                    })

                    .catch((error) => {

                        console.error(error);

                        alert(
                            "Error al guardar el platillo."
                        );

                    });

            }
        );

    }

});