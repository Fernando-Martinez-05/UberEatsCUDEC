db.collection("platillos").onSnapshot((datos) => {
    datos.forEach((registro) => {
mostrarPlatillo(registro.data(), registro.id);
    });
});