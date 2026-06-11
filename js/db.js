db.collection("platillos").onSnapshot((datos) => {
    datos.docChanges().forEach((registro) => {
if (registro.type === "added") {
        mostrarPlatillo(registro.doc.data(), registro.doc.id);
}
if (registro.type === "modified"){
        actualizarPlatillo(registro.doc.data(), registro.doc.id);
}
    }
);
});

const formularioAgregar = document.querySelector("form");
formularioAgregar.addEventListener("submit", (e) => {
e.preventDefault();
const platilloNuevo = {
    nombre: formularioAgregar.title.value,
    ingredientes:formularioAgregar.ingredientes.value,
    precio: formularioAgregar.price.value

}
db.collection("platillos").add(platilloNuevo)
.catch((error) =>{
    console.log(error);
    alert("Error al agregar platillo");
})

formularioAgregar.title.value = "";
formularioAgregar.ingredientes.value = "";
formularioAgregar.precio.value = "";
alert("Platillo Agregado");
});