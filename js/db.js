db.collection("platillos").onSnapshot((datos) => {
    datos.forEach((registro) => {
console.log(registro);
    });
});