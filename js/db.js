




db.collection("platillos").onSnapshot((coleccion) => {
    coleccion.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            mostrarPlatillo(registro.doc.data(), registro.doc.id);
            agregarALista(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "modified") {
            actualizarPlatillo(registro.doc.data(), registro.doc.id);
        }
        
    });
});

const formularioAgregar = document.querySelector("form");
formularioAgregar.addEventListener("submit", (e) => {
   e.preventDefault();
   const platilloNuevo = {
       nombre: formularioAgregar.title.value,
       ingredientes: formularioAgregar.ingredients.value,
       precio: formularioAgregar.price.value
   } 
    db.collection("platillos").add(platilloNuevo)
   .catch((error) => {
        console.log(error);
        alert("Error al agregar platillo");
    }
    );

    formularioAgregar.title.value = "";
   formularioAgregar.ingredients.value = "";
   formularioAgregar.price.value = "";
   alert("Platillo agregado");
});

const platilloBorrar = document.querySelector(".recipes");
platilloBorrar.addEventListener("click", (e) => {
    if (e.target.tagName === 'I') {
        const id = e.target.getAttribute("data-id");
        db.collection("platillos").doc(id).delete();
    }
})