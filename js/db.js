





db.collection("platillos").onSnapshot((coleccion) => {
    coleccion.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            mostrarPlatillo(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "modified") {
            actualizarPlatillo(registro.doc.data(), registro.doc.id);
        }
    });
});