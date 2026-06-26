db.collection("platillos").onSnapshot((datos) => {
  datos.docChanges().forEach((registro) => {
    if (registro.type === "added") {
      mostrarPlatillo(registro.doc.data(), registro.doc.id);
      if (typeof actualizarAlista === "function") actualizarAlista(); 
    }
  
  });
});

const formularioAgregar = document.querySelector("form");
formularioAgregar.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const platilloNuevo = {
    nombre: formularioAgregar.title.value,
    ingredientes: formularioAgregar.ingredients.value, 
    Precio: formularioAgregar.Precio.value 
  };

  db.collection("platillos").add(platilloNuevo)
    .then(() => {
      
      formularioAgregar.title.value = "";
      formularioAgregar.ingredients.value = ""; 
      formularioAgregar.Precio.value = ""; 
      alert("Platillo Agregado");
    })
    .catch((error) => {
      console.log(error);
      alert("Error al agregar platillo");
    });
});